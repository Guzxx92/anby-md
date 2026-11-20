export default {
    command: ['editplugin', 'editfile'],
    meta: {
    	description: 'edit plugins & file',
        category: "owner",
        usage: '<path|name> <overwrite|append#mode> <code#javascript>',
    },
    permission: {
        owner: 'real'
    },
    run: async ({
        m,
        args,
        command
    }) => {
        const [input, mode] = args
        const root = process.cwd()

        let file = null

        if (input.includes('/') || input.startsWith('.')) {
            file = path.resolve(root, input)
            if (!file.startsWith(root)) return m.reply(mess.plugin.add.denied)
            if (!fs.existsSync(file)) return m.reply(mess.plugin.del.not)
        } else {
            const target = path.extname(input) ? input : `${input}.js`
            const found = []
            const scan = d => {
                for (const f of fs.readdirSync(d)) {
                    if (f === 'node_modules' || f === 'trash' || f.startsWith('.hot-')) continue

                    const full = path.join(d, f)
                    const s = fs.statSync(full)

                    if (s.isDirectory()) scan(full)
                    else if (f === target) found.push(full)
                }
            }

            scan(root)

            if (!found.length) return m.reply(mess.plugin.del.not)
            if (found.length > 1) {
                return m.reply(
                    `${mess.plugin.del.more}\n` +
                    found.map(f => path.relative(root, f)).join('\n')
                )
            }

            file = found[0]
        }

        const content = m.text.replace(/^\S+\s+\S+\s+\S+[ \t]*\r?\n?/, '')
        if (!content) return m.reply(mess.code)

        if (mode === 'overwrite') fs.writeFileSync(file, content)
        else if (mode === 'append') fs.appendFileSync(file, '\n' + content)
        else return m.reply(mess.fitur.mode)

        m.reply(`*✓ ${mode} succes*\n>> ${path.relative(root, file)}`)
    }
}