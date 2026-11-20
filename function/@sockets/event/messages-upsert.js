/*───────── 𖦹 Leveling chat ୭˚.────୨────*/
import { Createsvg } from '../../svg.js'

function needXp(level) {
	return 5 * level ** 2 + 50 * level + 100
}

async function addXp(m, client) {
	const chat = global.db.data.chats[m.chat]
	if (!chat || chat.leveling === false) return

	const id = m.sender
	const levels = chat.levels ||= {}
	const user = levels[id] ||= {
		xp: 0,
		level: 1,
		lastXp: 0
	}

	const now = Date.now()
	if (now - user.lastXp < 60000) return

	user.xp += Math.floor(Math.random() * 11) + 15
	user.lastXp = now

	let up = false

	while (user.xp >= needXp(user.level)) {
		user.xp -= needXp(user.level)
		user.level++
		up = true
	}

	if (up) {
		const id = m.mentionedJid?.[0] || m.sender
		const user = chat.levels[id]

		const url = await client.profilePictureUrl(id, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')
		const foto = Buffer.from(await (await fetch(url)).arrayBuffer())

		const level = String(user.level).padStart(2, '0')
		const needed = 5 * user.level ** 2 + 50 * user.level + 100
		const svg = `
<svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
  <image href="./data/svg/levelup.png" x="0" y="0" width="800" height="450" preserveAspectRatio="xMidYMid slice" />
  <defs>
    <clipPath id="bulat1"><circle cx="400.5" cy="276.5" r="92.5" /></clipPath>
  </defs>
  <image href="@foto" x="308" y="184" width="185" height="185"
    preserveAspectRatio="xMidYMid slice" clip-path="url(#bulat1)" />
  <teks x="32" y="40" size="20" anchor="middle" fill="white">${level}</teks>
</svg>
`
		const hasil = await Createsvg(svg, {
			gambar: {
				foto
			},
			width: 1280
		})
		const caption =
			`🏆 *USER RANK - LEVEL UP!*\n` +
			`🌟 • Level: ${level}\n` +
			`🎉 Yay @${id.split('@')[0]} Level up -> ${user.level}!`

		await client.sendMessage(m.chat, {
			image: hasil,
			caption,
			mentions: [id]
		}, {
			quoted: m
		})
	}
}

/*───────── 𖦹 Message upsert ୭˚.────୨────*/
export default async function(update, client, authState) {
	const msg = update.messages?.[0]

	if (!msg?.message || !client.user?.lid) return
	if (Math.floor(Date.now() / 1000) - Number(msg.messageTimestamp) > 300) return
	if (debug) console.dir(msg, {
		depth: 3
	})

	const m = await serialize(client, msg)

	if (!m.text) return
	if (!m.message || m.key.remoteJid === 'status@broadcast') return
	if (m.key.remoteJid?.endsWith('@newsletter')) return
	if (m.key.remoteJid?.endsWith('@broadcast')) return

	const botLid = client.user.lid.split(':')[0] + '@lid'
	const itsMe = m.sender === botLid
	const messages = m.quoted || m
	const username = m.pushName || 'No Name'

	const quoted = match(messages?.mtype)
		.with('buttonsMessage', () => messages[Object.keys(messages)[1]])
		.with('templateMessage', () => messages.hydratedTemplate[Object.keys(messages.hydratedTemplate)[1]])
		.with('product', () => messages[Object.keys(messages)[0]])
		.otherwise(() => messages)

	const q = quoted?.msg || quoted
	const mime = q?.mimetype ||
		(q?.message?.imageMessage && 'image/jpeg') ||
		(q?.message?.videoMessage && 'video/mp4') ||
		(q?.message?.stickerMessage && 'image/webp') || ''

	const qmsg = quoted?.msg || quoted
	const isMedia = /image|webp|video|sticker|audio/.test(mime)

	if (m.mtype === 'pollUpdateMessage') {
		const key = m.msg.pollCreationMessageKey
		if (!key.fromMe) return

		const cached = global.pollCache.get(key.id)
		const poll = cached?.message || cached
		const secret = poll?.messageContextInfo?.messageSecret
		if (!secret) return

		const group = m.isGroup
		const me = group ?
			jidNormalizedUser(client.user.id) :
			client.user.lid.split(':')[0] + '@lid'

		const creator = key.participant || client.user.lid.split(':')[0] + '@lid'
		const voter = jidNormalizedUser(m.sender)

		try {
			const vote = decryptPollVote(m.msg.vote, {
				pollEncKey: secret,
				pollCreatorJid: creator,
				pollMsgId: key.id,
				voterJid: voter
			})

			const votes = getAggregateVotesInPollMessage({
				message: poll,
				pollUpdates: [{
					pollUpdateMessageKey: m.key,
					vote,
					senderTimestampMs: m.msg.senderTimestampMs?.toNumber?.() ?? Date.now()
				}]
			}, me)

			const pn = group ?
				await client.signalRepository.lidMapping.getPNForLID(m.sender) :
				m.key.remoteJidAlt

			const voterPn = jidNormalizedUser(pn || m.sender)
			const selected = votes.find(v =>
				v.voters.some(id => jidNormalizedUser(id) === voterPn)
			)

			if (selected) m.text = '.' + selected.name
		} catch (e) {
			log.error('Error polling:', e)
		}
	}

	m.text = m.text?.trim().replace(/^\.\s+/, '.')
	const cmd = m.text?.match(/^\.(\S+)/)?.[1]?.toLowerCase()
	const isCommand = !!cmd

	if (isCommand) await database_loader(m, botLid)

	const userdb = global.db.data.users[m.sender] || {}
	const chatdb = global.db.data.chats[m.chat] || {}
	const settingdb = global.db.data.settings[botLid] || {}
	const isOwner = !!userdb?.Owner
	const isPremium = !!userdb?.Premium

	if (chatdb?.mute) return

	const payload = {
		client,
		m,
		qmsg,
		isMedia,
		userdb,
		chatdb,
		settingdb,
		runtime,
		quoted,
		itsMe,
		username,
		botLid,
		mime
	}

	await addXp(m, client)
	global.plugin ||= {}
	global.plugin.run = text => {
		const [cmd, ...args] = text.trim().split(/\s+/)

		command$.next({
			...payload,
			command: cmd.slice(1).toLowerCase(),
			text: args.join(' '),
			args
		})
	}

	if (isCommand) return plugin.run(m.text.replace(/^\.\s+/, prefix))

	command$.next(payload)

	if (!isOwner) return
	if (m.text.startsWith('=>')) {
		try {
			const res = await eval(`(async () => ${m.text.slice(3)})()`)
			await m.reply(util.format(res))
		} catch (e) {
			await m.reply(String(e))
		}
	}

	if (m.text.startsWith('>>')) {
		try {
			const res = await eval(m.text.slice(2).trim())
			if (res !== undefined) await m.reply(util.format(res))
		} catch (e) {
			await m.reply(String(e))
		}
	}

	if (m.text.startsWith('$')) {
		exec(m.text.slice(2), (err, stdout) => {
			if (err) return m.reply(String(err))
			if (stdout) m.reply(stdout)
		})
	}
}