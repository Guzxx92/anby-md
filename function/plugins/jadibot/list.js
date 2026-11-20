export default {
    command: 'listjadibot',
    aliases: ['listbot', 'list-jadibot'],
    cooldown: 5000,
    meta: {
        category: 'jadibot',
        description: 'See the list of bots'
    },
    permission: {
        owner: true,
        private: true
    },
    run: async ({
        m,
        meta,
        args,
        clients
    }) => {
        const list = listCrest()

        if (!list.length) {
            return m.reply('*☘️ List Jadibots*\n\n- ~none~.')
        }

        let teks = '*☘️ List Jadibots:*\n\n'
        for (const [i, number] of list.entries()) {
            teks += `${i + 1}. ${number}\n`
        }

        m.reply(teks)
    }
}
