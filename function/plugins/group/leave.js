export default {
    command: 'leavegc',
    permission: {
	    owner: true
    },
    meta: {
        category: "group"
    },
    run: async ({
        client,
        m,
        command,
        text
    }) => {
        await m.reply("💚 byee byee, im leavin..")
        await client.groupLeave(m.chat)
    }
}