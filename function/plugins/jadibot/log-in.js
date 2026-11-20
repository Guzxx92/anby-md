import { clients, connections } from '../../@sockets/socket.js'

export default {
	command: 'jadibot',
	aliases: ['jdbot', 'start-jadibot'],
	queue: 2,
	cooldown: 12000,
	meta: {
		category: 'jadibot',
		description: 'Turn your number into a bot',
		usage: '<08xxx:number>'
	},
	permission: {
		owner: true,
		private: true
	},
	run: async ({
		m,
		args,
		client
	}) => {
		const session = [...clients.entries()]
			.find(([, socket]) => socket === client)?.[0]

		if (session && session !== 'main') return m.reply(mess.clone_one)

		const number = args[0]
			?.replace(/\D/g, '')
			.replace(/^08/, '628')
			.replace(/^008/, '628')

		const status = connections.get(number)

		match(status)
			.with('connected', () => {
				return m.reply(mess.clone_two)
			})
			.with('connected', () => {
				return
			})

		try {
			const result = await initCrest(true, {
				phoneNumber: number
			})

			const code = result?.code
			if (!code) return m.reply(mess.error.replace('Error', 'Pairing code failed'))

			return client.sendMessage(m.chat, {
				document: FileU.read("./package.json"),
				fileName: filename2,
				fileLength: 99999999999999,
				jpegThumbnail: FileU.read('./data/@etc/ui/hmmp!.jpg'),
				mimetype: "application/msword",
				caption: `*Code: [ ${code} ]*\n\n` + mess.linked,
				ai: false,
				contextInfo: {
					isForwarded: !m.isGroup,
					forwardingScore: 1
				}
			})
		} catch (err) {
			log.error(err)
			return m.reply(mess.error.replace('Error', 'Pairing code error'))
		}
	}
}