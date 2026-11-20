export default {
    command: 'welcome',
    permission: {
    	group: true,
    	owner: true
    },
    meta: {
        category: "group",
        usage: "<on/off>"
    },
    run: async ({
        client,
        m,
        command,
        text,
        chatdb
    }) => {
        const isWelcome = chatdb.group_participants

        if (text == "on") {
            if (isWelcome) return m.reply(mess.fitur.on)
            chatdb.group_participants = true
            return m.reply(mess.success)
        }
        
            if (!isWelcome) return m.reply(mess.fitur.off)
            chatdb.group_participants = false
            m.reply(mess.success)
        
    }
}