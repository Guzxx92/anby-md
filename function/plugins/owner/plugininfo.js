export default {
    command: 'plugininfo',
    permission: {
        owner: true
    },
    meta: {
        description: 'get plugin information',
        category: 'owner',
        usage: '<command>'
    },
    run: async ({ m, args }) => {
        const root = process.cwd()
        const input = args.join(' ').replace(/^\./, '').toLowerCase()

        const plugin = [...plugins.values()].find(p => {
            const commands = [
                ...(Array.isArray(p.command) ? p.command : [p.command]),
                ...(Array.isArray(p.aliases) ? p.aliases : [p.aliases])
            ]

            return commands.some(v =>
                typeof v === 'string' && v.toLowerCase() === input
            )
        })

        if (!plugin) return m.reply(mess.plugin.del.not)

        const file = plugin.__filename
    ? path.resolve(root, 'function/plugins', plugin.__filename)
    : null

        if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile())
            return m.reply(mess.plugin.del.not)

        const stat = fs.statSync(file)
        const code = fs.readFileSync(file, 'utf8')

        const info = {
            command: plugin.command,
            aliases: plugin.aliases || [],
            meta: plugin.meta || {},
            permission: plugin.permission || {},
            limit: plugin.limit ?? 0,
            cooldown: plugin.cooldown ?? 0,
            expire: plugin.expire ?? null,
            media: plugin.media ?? null
        }

        m.reply(
            `*📦 Plugin Information*\n` +
            `📁 Path: ${path.relative(root, file)}\n` +
            `📏 Size: ${formatSize(stat.size)}\n` +
            `📝 Lines: ${code.split('\n').length}\n` +
            `🕒 Modified: ${stat.mtime.toLocaleString()}\n\n` +
            `*✨ Configuration*\n` +
            '```\n' +
            JSON.stringify(info, null, 2) +
            '\n```'
        )
    }
}