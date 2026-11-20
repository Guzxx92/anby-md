export default {
    command: ['addowner', 'delowner'],
    aliases: 'toowner',
    meta: {
        description: 'add or del owner',
        category: 'owner',
        usage: '<access|real#access atau real> [user]'
    },
    permission: {
        owner: 'real'
    },
    run: async ({ m, args, command, meta }) => {     
        const target = m.quoted?.sender || m.mentionedJid[0]
        const level = args[0]?.toLowerCase()

        if (!target) return m.reply(
        	mess.reply_or_tag
        	.replace("@cmd", command)
        	.replace("@args", "access/real @tag")
        )

        global.db.data.users[target] ??= {}

        const user = global.db.data.users[target]

        if (command === 'addowner' || command === 'toowner') {
            if (!['access', 'real'].includes(level))
                return m.reply('*❗ Use: access / real*')

            if (user.Owner === 'real' && level !== 'real')
                return m.reply(mess.realowner)

            user.Owner = level
            user.Premium = true
        } else {
            if (user.Owner === 'real')
                return m.reply(mess.realowner)

            user.Owner = false
            user.Premium = false
        }

        await global.saveDB()
        m.reply(mess.plugin.owner)
    }
}