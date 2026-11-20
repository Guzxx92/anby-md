export default {
    command: ['addprem', 'delprem'],
    permission: {
    	owner: true
    },
    meta: {
        description: 'add or del prem',
        category: 'owner',
    },
    run: async ({
        m,
        command
    }) => {
        if (!m.quoted && m.mentionedJid.length === 0)
            return m.reply(
        	mess.reply_or_tag
        	.replace("@cmd", command)
        	.replace("@args", "@tag")
        )

        const target =
            m.quoted?.sender ||
            m.mentionedJid[0]

        if (!target) return

        console.log(target)
        if (command === 'addprem') {
            global.db.data.users[target].Premium = true
        } else {
            global.db.data.users[target].Premium = false
        }

        m.reply(mess.succes)
    }
}