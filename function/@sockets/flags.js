/*₊ ────୨──── 𖦹🍀୭˚.───୨────
    INI MENAMBAH FUNCTION KE SOKET

> panjang klo di jelaskan, ini memasukan function ke "client." (soket) dan sebagai wrapper
*───────── 𖦹🍀୭˚.────୨────*/

export function flagsSocket(client) {
	//*─────────*─────────
	client.public = true
	client.reina = true
	//*─────────*─────────
	client.getFile = async (PATH, returnAsFilename) => {
		let res, filename
		let data = Buffer.isBuffer(PATH) ? PATH :
			/^data:.*?\/.*?base64,/.test(PATH) ? Buffer.from(PATH.split`,` [1], "base64") :
			/^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).arrayBuffer().then(b => Buffer.from(b)) :
			FileU.exists(PATH) ? (filename = PATH, FileU.read(PATH)) :
			typeof PATH === "string" ? Buffer.from(PATH) : Buffer.alloc(0)

		if (!Buffer.isBuffer(data)) throw new TypeError("Result is not a buffer")

		if (data.length && returnAsFilename && !filename) {
			filename = path.join(import.meta.dirname, "../../data/trash/" + Date.now() + ".bin")
			await FileU.write(filename, data)
		}

		return {
			res,
			filename,
			mime: "application/octet-stream",
			ext: "bin",
			data,
			deleteFile: () => filename && FileU.remove(filename)
		}
	}

	client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
		const buffer = await client.downloadMediaMessage(message)
		const trueFileName = attachExtension ? `${filename}.bin` : filename
		await FileU.write(trueFileName, buffer)
		return trueFileName
	}

	client.sendTextWithMentions = (jid, text, quoted, options = {}) => client.sendMessage(jid, {
		text,
		contextInfo: {
			mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net')
		},
		...options
	}, {
		quoted
	})

	client.downloadMediaMessage = async (message) => {
		let mime = (message.msg || message).mimetype || ''
		let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
		const stream = await downloadContentFromMessage(message, messageType)
		const chunks = []
		for await (const chunk of stream) chunks.push(chunk)
		return Buffer.concat(chunks)
	}

	client.sendFile = async (jid, PATH, filename = '', caption = '', quoted, ptt = false, options = {}) => {
		const {
			data: file,
			filename: pathFile,
			mime
		} = await client.getFile(PATH, true)
		let mtype = 'document',
			mimetype = mime,
			convert
		if (/webp/.test(mime) || (/image/.test(mime) && options.asSticker)) mtype = 'sticker'
		else if (/image/.test(mime) || (/webp/.test(mime) && options.asImage)) mtype = 'image'
		else if (/video/.test(mime)) mtype = 'video'
		else if (/audio/.test(mime)) {
			convert = await (ptt ? toPTT : toAudio)(file, mime.split('/')[1])
			return client.sendMessage(jid, {
				audio: {
					url: convert.filename
				},
				mimetype: 'audio/ogg; codecs=opus',
				ptt,
				...options
			}, {
				quoted
			})
		}
		const message = {
			...options,
			caption,
			ptt,
			[mtype]: mtype === 'document' ? {
				url: pathFile
			} : file,
			mimetype,
			fileName: filename || path.basename(pathFile)
		}
		try {
			return await client.sendMessage(jid, message, {
				quoted,
				...options
			})
		} catch {
			return await client.sendMessage(jid, {
				...message,
				[mtype]: file
			}, {
				quoted,
				...options
			})
		}
	}

	client.sendImage = async (jid, PATH, caption = '', quoted, options = {}) => {
		const {
			data
		} = await client.getFile(PATH)
		return client.sendMessage(jid, {
			image: data,
			caption,
			...options
		}, {
			quoted
		})
	}

	client.sendImageAsSticker = async (jid, PATH, quoted, options = {}) => {
		const {
			data
		} = await client.getFile(PATH)
		const buffer = (options.packname || options.author) ? await writeExifImg(data, options) : await imageToWebp(data)
		return client.sendMessage(jid, {
			sticker: {
				url: buffer
			},
			...options
		}, {
			quoted
		})
	}

	client.sendVideoAsSticker = async (jid, PATH, quoted, options = {}) => {
		const {
			data
		} = await client.getFile(PATH)
		const buffer = (options.packname || options.author) ? await writeExifVid(data, options) : await videoToWebp(data)
		return client.sendMessage(jid, {
			sticker: {
				url: buffer
			},
			...options
		}, {
			quoted
		})
	}

	client.msToDate = (ms) => {
		const d = Math.floor(ms / 86400000),
			h = Math.floor(ms % 86400000 / 3600000),
			m = Math.floor(ms % 3600000 / 60000),
			s = Math.floor(ms % 60000 / 1000)
		return `${d} Hari ${h} Jam ${m} Menit ${s} Detik`
	}

	client.parseMs = (str) => {
		let ms = 0
		const d = str.match(/(\d+)\s*d/i)
		const h = str.match(/(\d+)\s*h/i)
		const mm = str.match(/(\d+)\s*m/i)
		const ss = str.match(/(\d+)\s*s/i)
		if (d) ms += parseInt(d[1]) * 86400000
		if (h) ms += parseInt(h[1]) * 3600000
		if (mm) ms += parseInt(mm[1]) * 60000
		if (ss) ms += parseInt(ss[1]) * 1000
		return ms
	}

	client.rand = (arr) => arr[Math.floor(Math.random() * arr.length)]

	client.sendPoll = async (jid, name, values, selectableCount = 1) => {
		const sent = await client.sendMessage(jid, {
			poll: {
				name,
				values,
				selectableCount,
			}
		})

		global.pollCache.set(sent.key.id, {
			message: sent.message,
			key: sent.key,
			chat: jid
		})
	}

	return client
}