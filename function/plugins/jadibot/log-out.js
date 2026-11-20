export default {
    command: 'stopjadibot',
    aliases: ['stopbot', 'stop-jadibot'],
    queue: 2,
    cooldown: 1200,
    meta: {
        category: 'jadibot',
        description: 'Turn your number into a chud',
        usage: '<08xxx:number>'
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
        await m.reply(
        	mess.jadibot_del
        )
        await multiCrest(args[0])
    }
}
