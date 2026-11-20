export default {
    command: ['setwelcome', 'setgoodbye', 'setpromote', 'setdemote'],
    permission: {
	    admin: true,
	    group: true
    },
    meta: {
        category: "group",
        usage: "<text#@user = tag, @group = group name>"
    },
    run: async ({
        client,
        m,
        username,
        runtime,
        chatdb,
        command,
        text
    }) => {
        m.reply(mess.done + "\n\n*Info:*\n- " + text)

        switch (command) {
            case 'setwelcome':
                chatdb.welcome = text
                break
            case 'setgoodbye':
                chatdb.goodbye = text
                break
            case 'setpromote':
                chatdb.promote = text
                break
            case 'setdemote':
                chatdb.demote = text
                break
        }
    }
}