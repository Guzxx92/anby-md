import { jidNormalizedUser } from 'baileys'

export default {
	command: ['setppgc', 'delppgc'],
	meta: {
		category: 'group'
	},
	permission: {
		group: true,
		admin: true,
		botadmin: true
	},
	run: async ({
		m,
		client,
		command
	}) => {
		try {
			if (command === 'setppgc') {
				const q = m.quoted || m

				if (!q) return m.reply(mess.media.replace('@media', 'image'))
				const buffer = await q.download()
				const dir = path.join(process.cwd(), 'data', 'trash')
				fs.mkdirSync(dir, {
					recursive: true
				})

				const inp = path.join(dir, `pp_${Date.now()}.jpg`)
				const out = path.join(dir, `pp_${Date.now()}_o.jpg`)

				fs.writeFileSync(inp, buffer)
				execFileSync('ffmpeg', [
					'-y', '-loglevel', 'error',
					'-i', inp,
					'-vf', 'scale=640:640:force_original_aspect_ratio=increase,crop=640:640',
					'-frames:v', '1', '-update', '1', '-q:v', '2',
					out
				], {
					stdio: 'ignore'
				})

				const img = fs.readFileSync(out)

				await client.query({
					tag: 'iq',
					attrs: {
						target: m.chat,
						to: '@s.whatsapp.net',
						type: 'set',
						xmlns: 'w:profile:picture'
					},
					content: [{
						tag: 'picture',
						attrs: {
							type: 'image'
						},
						content: img
					}]
				})

				fs.unlinkSync(inp)
				fs.unlinkSync(out)

				return m.reply(mess.update)
			}

			await client.removeProfilePicture(m.chat)
			return m.reply(mess.success)
		} catch (err) {
			return m.reply(`Gagal: ${err.message}`)
		}
	}
}