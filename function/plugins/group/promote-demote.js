async function update(client, chat, jid, action) {
    const key = `${chat}:${action}:${jid}`

    global.participant.add(key)

    try {
        return await client.groupParticipantsUpdate(chat, [jid], action)
    } finally {
        setTimeout(() => global.participant.delete(key), 15000)
    }
}

export default {
    command: ['promote', 'demote', 'demoteall', 'promoteall'],
    permission: {
	    group: true,
	    admin: true,
	    botadmin: true
	},
	meta: {
        category: "group"
    },
    run: async ({ client, m, command, text }) => {
        const chat = m.chat
        const group = await client.groupMetadata(chat)
        const members = group.participants
        const bot = client.user.lid || client.user.id
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

        const isAdmin = p => !!p.admin
        const isOwner = p => p.admin === 'superadmin' || p.id === group.owner
        const same = (a, b) => a === b

        if (command.endsWith('all')) {
            const action = command === 'promoteall' ? 'promote' : 'demote'

            const targets = members.filter(p => {
                if (same(p.id, bot) || same(p.id, m.sender)) return false
                if (action === 'promote') return !isAdmin(p)
                return isAdmin(p) && !isOwner(p)
            })

            if (!targets.length) return m.reply(mess.member.a)

            await m.reply(mess.wait)

            let success = 0
            let failed = 0
            let errors = 0
            let stopped = false

            for (const member of targets) {
                if (errors >= 3) {
                    stopped = true
                    break
                }

                try {
                    const current = await client.groupMetadata(chat)
                    const data = current.participants.find(p => same(p.id, bot))

                    if (!data?.admin) {
                        stopped = true
                        break
                    }

                    const fresh = current.participants.find(p => same(p.id, member.id))

                    if (!fresh) continue
                    if (action === 'promote' && isAdmin(fresh)) continue
                    if (action === 'demote' && (!isAdmin(fresh) || isOwner(fresh))) continue

                    await update(client, chat, member.id, action)
                    success++
                    errors = 0
                } catch {
                    failed++
                    errors++
                }

                await delay(Math.floor(Math.random() * 5000) + 5000)
            }
                            
			const oisuu = lang === 'en' ? `*🔥 ${command} finished*\n\n✅ Succeed: ${success}\n❌ Fail: ${failed}\n📦 Total target: ${targets.length}` : `*🔥 ${command} selesai*\n\n✅ Berhasil: ${success}\n❌ Gagal: ${failed}\n📦 Total target: ${targets.length}`
            return m.reply(
				oisuu
            )
        }

        let target

        if (m.quoted) {
            target = m.quoted.key?.participant
        } else if (mentioned.length) {
            target = mentioned[0]
        } else if (text) {
            const num = text.replace(/[^0-9]/g, '')
            if (num) target = `${num}@lid`
        }

        if (!target) return m.reply(mess.reply_or_tag)

        const member = members.find(p => same(p.id, target))
        if (!member) return m.reply(mess.member.not)

        if (command === 'demote' && isOwner(member)) {
            return m.reply(mess.member.cr)
        }

        if (command === 'demote' && same(target, m.sender)) {
            return m.reply(mess.member.dem)
        }

        try {
            await await client.groupParticipantsUpdate(chat, [member.id], action)
        } catch (e) {
            return m.reply(`*🍅 Failed to ${command}:* ${e}`)
        }
    }
}