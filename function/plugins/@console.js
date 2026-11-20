export default {
    run: async ({
        client,
        m,
        args,
        command,
        userdb,
        username
    }) => {
        const mesFrom = m.isGroup ? `[${chalk.green("Group")}]` : `[${chalk.red("Private")}]`
        const message = `\n┌─────────────────────────────┐\n└─────────────────────────────┘\n`
        
        const purple = gradient([
            "#753F9A",
            "#A66DD4"
        ])

        const green = gradient([
            "#A7D129",
            "#5F8F00"
        ])

        const blue = gradient([
            "#00D9FF",
            "#007BFF"
        ])

        const role = userdb.Owner ?
            `[${purple("𝗢𝘄𝗻𝗲𝗿")}]` :
            userdb.Premium ?
            `[${blue("𝗣𝗿𝗲𝗺i𝘂𝗺")}]` :
            `[${green("𝗠𝗲𝗺𝗯𝗲𝗿")}]`
        
        if (m.fromMe) return
        console.log(chalk.bold(message), role, username, mesFrom + `:`, m.text || "nothing")
    }
}