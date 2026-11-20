function cute(text) {
	const from = 'abcdefghijklmnopqrstuvwxyz'
	const to = Array.from('ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘ𝚀ʀꜱᴛᴜᴠᴡxʏᴢ')

	return text.replace(/[a-zA-Z]/g, char => to[from.indexOf(char)])
}

export default {
	command: 'menu',
	run: async ({
		m,
		client,
		userdb,
		username
	}) => {
		const plugins = [...new Set(global.plugins.values())]
		const categories = new Map()

		let mainMenu
		let more = String.fromCharCode(8206);
		let readmore = more.repeat(4001);
		let id = `${m.chat}:${m.sender}`
		let ownerMenu
		let aiMenu = `${readmore}
Claude Ai
IronMouse (Tikus besi)
King nasir
Sir alex
Guz akira
Surry Fex
`
		let memo = ['𐔌 . ⋮  ˃ ⤙ ˂  ֹ ₊ ꒱', '𐔌 . ⋮  ｡ •́︿• ̀｡  ֹ ₊ ꒱', '𐔌 . ⋮  ˶ᵔ ᵕ ᵔ˶ .ᐟ ֹ ₊ ꒱', '𐔌 . ⋮ .ꉂ ˵˃ ᗜ ˂˵ . ₊ ꒱', '𐔌 . ⋮ ˶• ༝ •˶ ♡ ֹ ₊ ꒱']
		let infouser = readmore + `╔┅━━―ᡣ𐭩─┈┈┈─―「 *ɪɴꜰᴏ ʙᴏᴛ* 」───────┈┈ᡣ𐭩──╕_
╠─────―────────―─────―─────―────―──
│   Nama Creator : *${author}*
│   OS running : *${os.platform()}*
┃   Runtime  Bot : ${runtime(process.uptime())} 
┃   Total user : -
╠◌𑀈.━━┈┈────୨「 *ɪɴꜰᴏ ᴜꜱᴇʀ* 」ৎ─────―─┈┈──•
┃   Premium user : *${userdb.Premium ? 'yes' : 'no'}*
┃   User : *${username}*
│   Cloverbits : 0
╽   Hit : ${userdb.hitcmd}
╚━┈┈───────━━━━• ▹▹▹\n\n`


		for (const plugin of plugins) {
	const category = plugin.meta?.category
	if (!category || !plugin.command) continue

	if (!categories.has(category)) {
		categories.set(category, [])
	}

	categories.get(category).push(...[].concat(plugin.command))
}

		let text = ''

		for (const [category, commands] of categories) {
			const title = category === 'main' ? 'ᴍᴀɪɴ ᴍᴇɴᴜ' : category

			text += `╔在𑁥─ 「 ${cute(title + ' menu')} 」 ── • • •\n`
			text += `┊  ┏┈┈─────━○∙··\n`

			if (commands.length === 1) {
				text += `│  ┊  ◦  ${commands[0]}\n`
			} else {
				commands.forEach((cmd, i) => {
					const line = i === 0 || i === commands.length - 1 ?
						'┊  ┊' :
						'│  │'

					text += `${line}  ◦  ${cmd}\n`
				})
			}

			text += `│  └━┈${await pickRandom('other', memo)}──◌𑀈._\n`
			text += `╚━͜͡}─══━━━──━══───͜͡}━༻¨*:·\n\n`
		}

		mainMenu = readmore + `\n*ʜᴀʟᴏ!* ☘️ ꜱᴀʏᴀ ᴀᴅᴀʟᴀʜ *ʙᴏᴛ ᴡʜᴀᴛꜱᴀᴩᴩ* ᴏᴛᴏᴍᴀᴛɪꜱ yᴀɴɢ ᴅᴀᴩᴀᴛ ᴍᴇᴍʙᴀɴᴛᴜ ᴍᴇʟᴀᴋᴜᴋᴀɴ ᴍᴇɴᴄᴀʀɪ ᴅᴀɴ ᴍᴇɴᴅᴀᴩᴀᴛᴋᴀɴ ᴅᴀᴛᴀ ᴀᴛᴀᴜ ɪɴꜰᴏʀᴍᴀꜱɪ ᴍᴇʟᴀʟᴜɪ ᴡʜᴀᴛꜱᴀᴩᴩ.\n\n${text}`
		return client.sendMessage(m.chat, {
			image: thumb1,
			contextInfo: {
				mentionedJid: [m.sender],
				isForwarded: true,
				forwardedNewsletterMessageInfo: {
					newsletterJid: ids,
					serverMessageId: null,
					newsletterName: nems
				},
			},
			caption: mainMenu,
			footer: ' ',
			interactiveAsTemplate: false,
		})
	}
}