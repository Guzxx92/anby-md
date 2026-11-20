export default {
    command: 'tree',
    permission: {
    	owner: true
    },
    meta: {
        category: 'owner',
    },
    run: async ({
        m
    }) => {
    	const ROOT = process.cwd()
        const ignore = ['node_modules', 'session']
        const plugins = ['plugins', 'function/plugins']

        const lines = []

        const walk = (dir, prefix = '') => {
            const items = fs.readdirSync(dir, {
                    withFileTypes: true
                })
                .filter(i => !ignore.includes(i.name))

            items.forEach((item, i) => {
                const isLast = i === items.length - 1
                const pointer = isLast ? '└─ ' : '├─ '
                const full = path.join(dir, item.name)
                const rel = path.relative(ROOT, full)

                lines.push(prefix + pointer + item.name)

                if (
                    item.isDirectory() &&
                    !plugins.includes(rel.replace(/\\/g, '/'))
                ) {
                    walk(
                        full,
                        prefix + (isLast ? '   ' : '│  ')
                    )
                }
            })
        }

        lines.push(path.basename(ROOT) + '/')
        walk(ROOT)

        m.reply(
            '```' +
            lines.join('\n') +
            '```'
        )
    }
}