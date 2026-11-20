const meta = import.meta.dirname
const sesi = '../../data/@etc/session'
const logger = pino({
	level: 'silent'
})

export const clients = new Map()
export const states = new Map()
export const connections = new Map()
export const timer_pairing = new Map()
export const reconnecting = new Set()

/*₊ ────୨──── 𖦹🍀୭˚.───୨────
         INI SOCKET UTAMA 

> numero itu pembersih nomor, question() Akan di panggil klo session "main" gada dan bakal nanya pilih mana: bisa qr (manggil connection update) atau pairing(). initCrest buat register & jalankan session, multiCrest buat loop session selain "main" (nomor, 08xxx). listCrest nampilin list session (selain "main")
*───────── 𖦹🍀୭˚.────୨────*/

const numero = num => num.replace(/\D/g, '').replace(/^08/, '628').replace(/^008/, '628')

async function question() {
	while (true) {
		const type = await qs(`${chalk.black.bgBlue(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} choose your method:\n\n1. [Scan QR]\n2. [Pairing code] : `)
		const result = match(type.trim())
			.with('1', () => false)
			.with('2', () => true)
			.otherwise(() => null)

		if (result !== null) return result
		console.log(`${chalk.black.bgRed(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} Sir, please choose 1 or 2:\n`)
	}
}

async function pairing() {
	while (true) {
		const num = await qs(`${chalk.black.bgBlue(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} Enter your num: `)
		if (num?.length >= 10) return num
		console.log(`${chalk.black.bgYellow(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} Are you serious ?\n`)
	}
}

export async function initCrest(jadibot = false, data = {}) {
	const id = jadibot ? numero(data.phoneNumber) : 'main'
	const binderCrest = path.join(meta, sesi, id)
	const oldWand = clients.get(id)

	if (oldWand) {
		clearTimeout(timer_pairing.get(id))
		timer_pairing.delete(id)

		try {
			oldWand.ev.removeAllListeners()
			oldWand.ws?.close()
			oldWand.end?.()
		} catch {}

		clients.delete(id)
		states.delete(id)
		connections.delete(id)
	}

	await FileU.mkdir(binderCrest)

	const {
		state,
		saveCreds,
	} = await useMultiFileAuthState(binderCrest)

	states.set(id, {
		state,
		saveCreds
	})

	if (debug) {
		console.log('\nSession:', binderCrest)
		console.log('Registered:', state.creds.registered)
		console.log('Me:', state.creds.me)
		console.log('Keys:', Object.keys(state.creds))
		console.log({
			path: binderCrest,
			registered: state.creds.registered,
			hasMe: Boolean(state.creds.me),
			hasAccount: Boolean(state.creds.account),
			hasNoiseKey: Boolean(state.creds.noiseKey),
			hasSignedIdentityKey: Boolean(state.creds.signedIdentityKey)
		})
	}

	const registered = state.creds.registered

	let regist = !registered && jadibot
	let code = null

	if (!registered && !jadibot) {
		regist = await question()
	}

	const {
		version
	} = await fetchLatestBaileysVersion()
	const client = makeWASocket({
    	browser: Browsers.windows('Edge'),
    	version,
    	auth: {
        	creds: state.creds,
        	keys: makeCacheableSignalKeyStore(state.keys, logger)
    	},
    	logger,
    	syncFullHistory: false,
    	shouldSyncHistoryMessage: () => false,
    	markOnlineOnConnect: false,
    	emitOwnEvents: false,
    	fireInitQueries: false,
    	generateHighQualityLinkPreview: false
	})

	if (regist && !client.authState.creds.registered) {
		const num = numero(jadibot ? data.phoneNumber : await pairing())

		await new Promise(resolve => setTimeout(resolve, 3000))

		code = await client.requestPairingCode(num, pairKey)
		code = code.slice(0, 4) + '-' + code.slice(4)

		if (jadibot) {
			connections.set(id, 'pairing')

			const timer = setTimeout(async () => {
				if (clients.get(id) !== client) return
				if (connections.get(id) !== 'pairing') return

				Spinnup.warn(`Jadibot ${id} already timeout..`)

				clearTimeout(timer_pairing.get(id))
				timer_pairing.delete(id)

				try {
					client.ev.removeAllListeners()
					client.ws?.close()
					client.end?.()
				} catch {}

				clients.delete(id)
				states.delete(id)
				connections.delete(id)

				await FileU.remove(binderCrest)
			}, 5 * 60 * 1000)

			timer_pairing.set(id, timer)
			timer.unref?.()
		} else {
			process.stdout.write('\x1B[1A\r\x1B[2K')
			console.log(`${chalk.black.bgYellow(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} Enter this code: [ ${chalk.cyan(code)} ]`)
		}
	}

	for (const [event, eventPath] of Object.entries(eventMap)) {
		client.ev.on(event, async (...args) => {
			const module = await import(eventPath)
			module.default(...args, client, states.get(id), regist, id, clients, states, connections, timer_pairing, reconnecting)
		})
	}

	flagsSocket(client)
	clients.set(id, client)

	return jadibot && code ? {
			client,
			code
		} :
		client
}

export async function multiCrest(delet = false) {
	if (delet) {
		const id = numero(delet)
		const client = clients.get(id)

		clearTimeout(timer_pairing.get(id))
		timer_pairing.delete(id)

		try {
			await client?.logout()

			client?.ev.removeAllListeners()
			client?.ws?.close()
			client?.end?.()
		} catch {}

		clients.delete(id)
		states.delete(id)
		connections.delete(id)

		await FileU.remove(path.join(meta, sesi, id))

		return true
	}

	const folder = path.join(meta, sesi)
	if (!FileU.exists(folder)) return

	const sessions = await FileU.readdir(folder)

	for (const entry of sessions) {
		if (!entry.isDirectory() || entry.name === 'main') continue
		await initCrest(true, {
			phoneNumber: entry.name
		})
	}
}

export function listCrest(nom = false) {
	if (nom) {
		const id = numero(nom)
		const folder = path.join(meta, sesi, id)

		if (!FileU.exists(folder)) return false
		return FileU.readdir(folder)
			.some(file => FileU.isFile())
	}

	return [...clients.keys()].filter(id => id !== 'main')
}