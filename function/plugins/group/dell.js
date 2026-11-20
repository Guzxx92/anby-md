export default {
    command: 'del',
    permission: {
	    botadmin: true,
	    group: true
    }, 
    meta: {
        category: "group",
        target: 'reply'
    },
    run: async ({
        client,
        m,
        command,
        text
    }) => {
        client.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                id: m.quoted.id,
                fromMe: m.quoted.fromMe,
                participant: m.quoted.sender
            }
        })
    }
}