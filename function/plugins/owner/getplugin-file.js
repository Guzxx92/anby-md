export default {
    command: ['getplugin', 'getfile'],
    permission: {
        owner: 'real'
    },
    meta: {
    	category: 'owner',
        usage: '<name|path>'
    },
    run: async ({ m, args, command }) => {
        const root = process.cwd()
        const input = args.join(' ')
        const meta = command === 'getplugin'
            ? path.join(root, 'function/plugins')
            : root

        let target = null

        if (input.includes('/') || path.extname(input)) {
            const resolved = path.resolve(meta, input)
            const rel = path.relative(root, resolved)

            if (rel.startsWith('..') || path.isAbsolute(rel))
                return m.reply(mess.plugin.add.denied)

            if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile())
                return m.reply(mess.plugin.del.not)

            target = resolved
        } else {
            const results = []

            const scan = dir => {
                for (const f of fs.readdirSync(dir)) {
                    if (['node_modules', 'trash'].includes(f) || f.startsWith('.hot-')) continue

                    const full = path.join(dir, f)
                    const stat = fs.statSync(full)

                    if (stat.isDirectory()) scan(full)
                    else if (path.parse(f).name === input) results.push(full)
                }
            }

            scan(meta)

            if (!results.length) return m.reply(mess.plugin.del.not)
            if (results.length > 1) {
                return m.reply(
                    `${mess.plugin.del.more}\n` +
                    results.map(f => path.relative(root, f)).join('\n')
                )
            }

            target = results[0]
        }

        const code = fs.readFileSync(target, 'utf8')

        m.reply(
        	`${mess.plugin.del.found}\n` +
            `- ${path.relative(root, target)}\n\n` +
            code
        )
    }
}