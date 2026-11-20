export default {
    command: ['restart', 'shutdown'],
    permission: {
        owner: true
    },
    meta: {
        category: 'owner',
    },
    run: async ({ client, m, command }) => {
        if (command === 'shutdown') {
            await m.reply(mess.success.replace("Command", "Shutdown"))
            setTimeout(() => process.send?.('shutdown'))
            return
        }

        global.db.data.others.restart = m.chat

        await global.saveDB()
        await m.reply(mess.wait.replace("Requesting", "Restarting"))

        setTimeout(() => process.send?.('reset'), 1500)
    }
}