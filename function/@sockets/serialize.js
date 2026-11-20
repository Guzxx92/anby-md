/*₊ ────୨──── 𖦹🍀୭˚.───୨────
INI MENAMBAH FUNCTION DAN WRAPPER KE OBJECT (M)

> panjang klo di jelaskan, ini memasukan function ke "m." (serialize) dan sebagai wrapper, di panggil setiap ada pesan baru
*───────── 𖦹🍀୭˚.────୨────*/

export const serialize = async (client, m, store = null) => {
    try {
        if (!m) return m

        const M = proto.WebMessageInfo

        if (m.key) {
            m.id = m.key.id
            m.isBaileys = m.id?.startsWith('BAE5') && m.id.length === 16
            m.chat = m.key.remoteJid
            m.fromMe = m.key.fromMe
            m.isGroup = m.chat?.endsWith('@g.us')
            m.sender = m.fromMe ? client.user.lid.split(':')[0] + '@lid' : m.participant || m.key.participant || m.chat || ''

            if (m.isGroup) m.participant = m.key.participant || ''
        }

        if (m.message) {
            m.mtype = getContentType(m.message)
            m.msg = m.mtype === 'viewOnceMessage'
                ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
                : m.message[m.mtype]

            const msg = m.msg
            const context = msg?.contextInfo

            m.body = m.message.conversation ||
                msg?.caption ||
                msg?.text ||
                (m.mtype === 'listResponseMessage' && msg.singleSelectReply?.selectedRowId) ||
                (m.mtype === 'buttonsResponseMessage' && msg.selectedButtonId) ||
                (m.mtype === 'templateButtonReplyMessage' && msg.selectedId) ||
                (m.mtype === 'buttonReplyMessage' && msg.selectedId) ||
                (m.mtype === 'interactiveResponseMessage' && (() => {
                    try {
                        const json = JSON.parse(msg.nativeFlowResponseMessage?.paramsJson || '{}')
                        return json.id || json.rowId || json.selectedId || ''
                    } catch {
                        return ''
                    }
                })()) ||
                m.text

            const quoted = context?.quotedMessage
            m.quoted = quoted || null
            m.mentionedJid = context?.mentionedJid || []

            if (msg?.caption) m.caption = msg.caption

            if (quoted) {
                const type = Object.keys(quoted)[0]
                let q = quoted[type]

                if (type === 'productMessage') {
                    const key = Object.keys(q)[0]
                    q = q[key]
                }

                if (typeof q === 'string') q = { text: q }

                m.quoted = q
                q.mtype = type
                q.id = context.stanzaId
                q.chat = context.remoteJid || m.chat
                q.isBaileys = q.id ? q.id.startsWith('BAE5') && q.id.length === 16 : false
                q.sender = context.participant
                q.fromMe = q.sender === client.user.lid
                q.text = q.text || q.caption || q.conversation || q.contentText || q.selectedDisplayText || q.title || ''
                q.mentionedJid = context.mentionedJid || []

                q.getQuotedObj = q.getQuotedMessage = async () => {
                    if (!q.id || !store?.loadMessage) return false
                    const result = await store.loadMessage(m.chat, q.id, inf)
                    return serialize(client, result, store)
                }

                const fakeObj = q.fakeObj = M.fromObject({
                    key: {
                        remoteJid: q.chat,
                        fromMe: q.fromMe,
                        id: q.id
                    },
                    message: quoted,
                    ...(m.isGroup ? { participant: q.sender } : {})
                })

                q.delete = () => client.sendMessage(q.chat, { delete: fakeObj.key })
                q.download = () => client.downloadMediaMessage(q)
            }
        }

        if (m.msg?.url) m.download = () => client.downloadMediaMessage(m.msg)

        m.text = m.body ||
            m.msg?.text ||
            m.msg?.caption ||
            m.message?.conversation ||
            m.msg?.contentText ||
            m.msg?.selectedDisplayText ||
            m.msg?.title ||
            ''
        m.reply = (mess, chatId = m.chat, options = {}) => {
            return client.sendMessage(chatId, {
                document: FileU.read('./package.json'),
                fileName: filename1,
                fileLength: 99999999999999,
                mimetype: 'image/png',
                jpegThumbnail: thumb1x1,
                caption: mess,
                ai: false,
            }, { quoted: m })
        }
        
        return m
    } catch (err) {
        log.error(err)
        return m
    }
}