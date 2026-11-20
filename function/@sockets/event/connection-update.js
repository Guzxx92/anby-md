let connect // biarin let nya punya pasangan
let line = 0

function iShowQr(qr) { // not iShowSpeed
    if (line) {
        process.stdout.write(`\x1B[${line}A`)
        process.stdout.write('\x1B[J')
    }

    Spinnup.warn('Scan this QR:\n')
    qrcode.generate(qr, { small: true }, output => {
        process.stdout.write(output + '\n')
        line = output.split('\n').length
    })
}

async function reconnect({ id, client, reconnecting, clients, connections }) {
    if (reconnecting.has(id)) return
    if (clients.get(id) !== client) return

    reconnecting.add(id)
    connections.set(id, 'reconnecting')	 
    
    try {
        if (clients.get(id) !== client) return

        client.ev.removeAllListeners()
        client.ws?.close()
        client.end?.()

        await initCrest(
            id !== 'main',
            id === 'main'
                ? {}
                : { phoneNumber: id }
        )
    } catch (err) {
        Spinnup.error(`Reconnect failed:`, err)
        await delay(4000)
    } finally {
        reconnecting.delete(id)
    }
}

export default async function (update, client, auth, pairing, id, clients, states, connections, timer_pairing, reconnecting) {
    const { connection, lastDisconnect, qr } = update
	const luv_u = { id, client, reconnecting, clients, connections }
	
	await delay(2000)
    match({ qr, pairing })
        .with({ qr: P.string, pairing: false }, ({ qr }) => {
            iShowQr(qr)
        })
        .otherwise(() => {})

    match(connection)
    	.with("connecting", async () => {
    		await delay(3000)
    		Spinnup.success("Connecting to WhatsApp...")
    	})
    	.with("open", async () => {
    		clearTimeout(timer_pairing.get(id))
    		timer_pairing.delete(id)

    		connections.set(id, 'connected')  	
    		await delay(3000)	
    		Spinnup.info("Successfully connected to WhatsApp")
    		
    		const notice = global.db.data.others.restart
    		if (!notice) return

    try {
        await client.sendMessage(notice, { 
	        text: mess.restart_suc
        })

        delete global.db.data.others.restart
        await global.saveDB()
    } catch (err) {
        log.error('Restart notification error:', err)
    }
    	})
    	.with("close", async () => {
    		const reason = lastDisconnect?.error?.output?.statusCode
			const what_reason =  "umm... bitch?"
			
			Spinnup.error(`Connection closed, reason: ${reason}`)
    		await match(reason)
    			.with(DisconnectReason.loggedOut, async () => {
    				Spinnup.error(`[${id}] Device logged out.`)

    				clearTimeout(timer_pairing.get(id))
    				timer_pairing.delete(id)

    				connections.delete(id)
    				clients.delete(id)
    				states.delete(id)
    				
    				try {
			    		const session = path.join(import.meta.dirname, '../../../data/@etc/session', id)

        				await FileU.remove(session)
        				Spinnup.success(`[${id}] Session has been deleted cuz log out.`)      			
        				
    				} catch (err) {
        				log.error(`[${id}] Failed to delete session:`, err)
    				}
    			})
    			.with(DisconnectReason.restartRequired, async () => {
    				await reconnect(luv_u)
    			})
    			.with(
    				P.union(
    					DisconnectReason.connectionClosed,
    					DisconnectReason.connectionLost,
    					DisconnectReason.connectionReplaced,
    					DisconnectReason.timedOut
    				),
    				async () => {
    					connections.set(id, 'disconnected') 		
    					setTimeout(async() => {
    						Spinnup.warn("Connection closed. restart required.")
    						await reconnect(luv_u)
    					}, 2000)	
    				}
    			)
    			.otherwise(() => {
    				connections.set(id, 'disconnected')
    				Spinnup.warn("Unhandled disconnect reason.")
    			})
    	})
    .otherwise(() => {})
}
