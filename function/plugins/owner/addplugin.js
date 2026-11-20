export default {
    command: 'addplugin',
    meta: {
    	description: 'adding a plugins',
        category: 'owner',
        usage: '<path/file.js#path/name file> <code#javascript>',
    },
    permission: {
        owner: 'real'
    },
    run: async ({
        m,
        args
    }) => {
        const input = args[0]
        const text = m.text.replace(/^\S+\s+\S+[ \t]*\r?\n?/, '')
        const root = process.cwd()
        const meta = path.join(
            root,
            'function/plugins'
        )

        const claw = path.resolve(meta, input)

        if (!claw.startsWith(root)) return m.reply(mess.plugin.add.denied)
        if (!claw.endsWith('.js')) return m.reply(mess.plugin.add.ex)

        fs.mkdirSync(path.dirname(claw), {
            recursive: true
        })

        if (fs.existsSync(claw)) return m.reply(mess.plugin.add.exist)
        
        fs.writeFileSync(claw, text)

        m.reply(
            `${mess.plugin.add.suc}\n` +
            `>> ${path.relative(root, claw)}`
        )
    }
}