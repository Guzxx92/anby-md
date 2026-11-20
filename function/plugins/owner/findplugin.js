export default {
    command: 'findplugin',
    meta: {
    	usage: '<command>',
    	description: 'find a plugins',
    	category: 'owner'
    },
    permission: {
        owner: 'real'
    },
    run: async ({ m, args }) => {
        const root = process.cwd()
        const results = []
        const target = args[0].toLowerCase()

        const scan = d => {
            for (const f of fs.readdirSync(d)) {
                if (['node_modules', 'trash'].includes(f) || f.startsWith('.hot-')) continue

                const full = path.join(d, f)
                const s = fs.statSync(full)

                if (s.isDirectory()) scan(full)
                else if (f.endsWith('.js')) {
                    const code = fs.readFileSync(full, 'utf8')
                    const match = code.match(/command\s*:\s*(?:'([^']+)'|"([^"]+)"|`([^`]+)`|\[([^\]]+)\])/)

                    if (!match) continue

                    const commands = match[4]
                        ? [...match[4].matchAll(/['"`]([^'"`]+)['"`]/g)].map(v => v[1])
                        : [match[1] || match[2] || match[3]]

                    if (commands.some(v => v.toLowerCase() === target))
                        results.push(path.relative(root, full))
                }
            }
        }

        scan(root)

        if (!results.length) return m.reply(mess.plugin.del.not)

        m.reply(mess.plugin.del.found + "\n- " + results.join('\n'))
    }
}