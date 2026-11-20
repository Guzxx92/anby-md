export default {
    command: 'joingc',
    permission: {
	    owner: true
    },
    meta: {
        category: "group",
        usage: "<url:link>"
    },
    run: async ({ client, m, args, text }) => {
        try {
            const code = text.split('/').pop().split('?')[0].trim()
            if (!code) return m.reply(mess.link)

            const response = await client.groupAcceptInvite(code);
            m.reply(`${mess.join} ${response}`);
        } catch (e) {
            console.log(e);
            m.reply(`*🍅 Failed:* ${e.message || e}`);
        }
    }
}