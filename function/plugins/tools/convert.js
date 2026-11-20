export default {
    command: 'tomp3',
    run: async ({
        client,
        m,
        command
    }) => {

        if (!m.quoted) return 

        const mime = m.quoted.mimetype || ''
        const buffer = await m.quoted.download()
        const ext = mime.split('/')[1]

                if (mime.startsWith('video/')) {
                   let result = await toPTT(buffer, ext)
   
                    await client.sendMessage(m.chat, {
                        audio: result.data,
                        mimetype: 'audio/ogg; codecs=opus',
                       // ptt: true
                    }, {
                        quoted: m
                    })

                    await result.delete()
                 
                } else {}
}}