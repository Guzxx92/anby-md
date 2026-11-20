import { createHotLoader } from './function/loader.js'

const meta = import.meta.dirname
const plugdisk = path.join(meta, './function/plugins')
const plugins = new Map()
const stands = new Map()
const cooldowns = new Map()
const queues = new Map()
const watchers = new Map()
const spam = new Map()
const hmps = new Map()

/*₊ ────୨──── 𖦹🍀୭˚.───୨────
           INI LOADER PLUGIN

> binggung dengan nama fuction nya?? anggap aja misal start() itu startPlugin() ngerti apa yg ku maksud?? semua kode di bawah ini hanya bertentangan dengan sistem plugin.
*───────── 𖦹🍀୭˚.────୨────*/

const isPlugin = name => name.endsWith('.js')
const valid = {
    link: {
        test: isUrl,
        error: arg.LINK
    },
    number: {
        test: x => x.trim() !== '' && !isNaN(x),
        error: arg.NUMBER
    },
    text: {
        test: x => typeof x === 'string' && x.length > 0,
        error: arg.TEXT
    },
    user: {
        test: x => /^\d{5,20}(?:@s\.whatsapp\.net|@lid)?$/.test(x.replace(/^@/, '')),
        error: arg.USER
    }
}

global.plugins = plugins

function remove(pluginx) {
    stands.delete(pluginx)

    for (const [cmd, plugin] of plugins) {
        if (plugin.__filename === pluginx) {
            plugins.delete(cmd)
        }
    }
}

function register(file, mod) {
    const plugin = mod.default
    if (typeof plugin?.run !== 'function') return

    const name = path.relative(plugdisk, file)
    plugin.__filename = name

    const list = [
        ...[].concat(plugin.command || []),
        ...(plugin.aliases || [])
    ].filter(c => typeof c === 'string' && c.trim())

    if (list.length) {
        for (const cmd of list) {
            plugins.set(cmd.trim().toLowerCase(), plugin)
        }
    } else {
        stands.set(name, plugin)
    }
}

function scan(pluginx) {
    for (const entry of FileU.readdir(pluginx)) {
        const full = path.join(pluginx, entry.name)

        if (entry.isDirectory()) {
            scan(full)
        } else if (isPlugin(entry.name)) {
            const name = path.relative(plugdisk, full)

            try {
                register(full, hot.get(full))
            } catch (err) {
                if (err.message && err.message.includes("Модуль еще не загружен")) return
                log.error('Plugin error:', full, err)
            }
        }
    }
}

function refresh() {
    plugins.clear()
    stands.clear()
    scan(plugdisk)
}

const hot = await createHotLoader({
    snapshotDir: './data/trash',
    usePolling: true,
    debounceMs: 150,
    onReload(file) {
        refresh()
    },
    onError(...args) {
        Spinnup.error(...args)
    },
})

refresh()
/*───────── 𖦹 Fitur plugins ୭˚.────୨────*/
function isExpired(expire) {
    if (!expire) return false

    const date = new Date(`${expire}T23:59:59.999+07:00`)
    return Number.isNaN(date.getTime()) || Date.now() > date.getTime()
}

function hmp(text, m, client, cooldown = 60000) {
    const key = `${m.chat}:${m.sender}:${text}`
    const now = Date.now()

    if (now - (hmps.get(key) || 0) < cooldown) return

    hmps.set(key, now)

    client.sendMessage(m.chat, {
        document: FileU.read("./package.json"),
        fileName: filename2,
        fileLength: 99999999999999,
        jpegThumbnail: FileU.read('./data/@etc/ui/hmmp!.jpg'),
        mimetype: "application/msword",
        caption: text,
        ai: false,
        contextInfo: {
            isForwarded: !m.isGroup,
            forwardingScore: 1
        }
    }).catch(() => hmps.delete(key))
}

function isCooldown(plugin, m, client) {
    const time = Number(plugin.cooldown)

    if (!Number.isFinite(time) || time <= 0) return true

    const key = `${plugin.__filename}:${m.sender}`
    const now = Date.now()
    const data = cooldowns.get(key)

    if (data && now < data.until) {
        if (!data.replied) {
            data.replied = true
            hmp(mess.cooldown.replace('@time', formatTime(data.until - now)), m, client, time)
        }

        return false
    }

    cooldowns.set(key, {
        until: now + time,
        replied: false
    })

    return true
}

function fielddisk(usage) {
    return [...(usage || '').matchAll(/<([^<>]+)>/g)].map(([_, value]) => {
        const i = value.indexOf('#')
        const body = i === -1 ? value : value.slice(0, i)
        const tag = i === -1 ? '' : value.slice(i + 1).trim()
        const [name, type] = body.split(':')

        return { name, type, tag }
    })
}

function inputdisk(usage, args) {
    if (!usage) return {}

    const fields = fielddisk(usage)
    const input = {}
    let pos = 0

    for (let i = 0; i < fields.length; i++) {
        const { name } = fields[i]
        const type = fields[i].type || 'text'
        const count = type === 'text' ?
            args.length - pos - (fields.length - i - 1) :
            1

        const value = args.slice(pos, pos + count).join(' ')

        input[name] = type === 'number' ? Number(value) : value
        pos += count
    }

    return input
}

function usagedisk(plugin, args, m, cmd) {
    const use = plugin.meta?.usage
    if (!use) return null

    const required = fielddisk(use).map(({ name, type, tag }) => ({
        name,
        type: type || name,
        tag
    }))

    const display = required
        .map(({ name }) => `<${name}>`)
        .join(' ')

    const help = mess.help
        .replace(/@cmd/g, cmd)
        .replace(/@args/g, `*${display}*`)
        .replace(/@example/g, plugin.meta.description || 'a command')

    const error = ({ type, tag }) => tag || (valid[type] || valid.text).error

    if (args.length < required.length) {
        return help + '\n' + required
            .slice(args.length)
            .map(field => `*<${field.name}>* ${error(field)}`)
            .join('\n')
    }

    for (let i = 0; i < required.length; i++) {
        const { name, type } = required[i]
        const validator = valid[type] || valid.text

        if (!validator.test(args[i])) {
            return `${help}\n*<${name}>* ${error(required[i])}`
        }
    }

    return null
}
/*───────── 𖦹 Commands ୭˚.────୨────*/
async function start(cmd, plugin, data) {
    const max = Math.max(0, Number(plugin.queue) || 0)
    const key = plugin.__filename || plugin
    const sender = data.m.sender

    let q = queues.get(key)

    if (!q) {
        q = {
            running: 0,
            waiting: [],
            users: new Set()
        }
        queues.set(key, q)
    }

    if (q.users.has(sender)) return 'dupe'
    if (q.running) {
        if (q.waiting.length >= max) return false

        q.waiting.push({ cmd, plugin, data })
        q.users.add(sender)

        return 'queued'
    }

    q.running = 1
    q.users.add(sender)

    try {
        let current = { cmd, plugin, data }

        while (current) {
            try {
                await current.plugin.run(current.data)
            } catch (err) {
                log.error(`Plugin error: [${current.plugin.__filename || 'Unknown'}] ≥`, err)
            }

            q.users.delete(current.data.m.sender)
            current = q.waiting.shift()
        }
    } finally {
        q.running = 0

        if (!q.waiting.length) {
            queues.delete(key)
        }
    }

    return true
}

function distance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i])

    for (let j = 0; j <= b.length; j++) dp[0][j] = j
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            )
        }
    }

    return dp[a.length][b.length]
}

function suggest(cmd) {
    let best = null

    for (const name of plugins.keys()) {
        const diff = distance(cmd.toLowerCase(), name.toLowerCase())
        const max = name.length <= 8 ? 1 : 2

        if (diff <= max && (!best || diff < best.diff)) {
            best = { target: name, diff }
        }
    }

    return best?.target || null
}

function antiSpam(m, cmd) {
  const id = m.chat
  const now = Date.now()

  let data = (spam.get(id) || []).filter(x => now - x.time <= 20000)

  data.push({ cmd, time: now })
  if (data.length > 5) data.shift()

  spam.set(id, data)
  if (data.length < 5) return false

  const cmds = data.map(x => x.cmd)
  const same = cmds.every(x => x === cmd)
  const repeat = cmds[0] === cmds[5 - 1]

  return same || repeat || data[5 - 1].time - data[0].time <= 20000
}

command$.subscribe(system => {
    if (!system?.m?.text) return

    void (async () => {
        try {
            let {
                m,
                client,
                botLid,
                command,
                args = []
            } = system

            for (const plugin of stands.values()) {
                try {
                    await plugin.run(system)
                } catch (err) {
                    log.error(`Plugin error: [${plugin.__filename || 'Unknown'}] ≥`, err)
                }
            }

            if (!command) return

            let cmda = command.toLowerCase()
            let plugin = plugins.get(cmda)

            if (!plugin) {
                const target = suggest(cmda)

                if (!target) return

                command = target
                cmda = target
                plugin = plugins.get(target)
            }

            const user = global.db.data.users[m.sender]
            if (!user) return

            const owner = user.Owner
const isOwner = owner === 'access' || owner === 'real'
const isReal = owner === 'real'
const isPremium = Boolean(user.Premium) || isOwner
            const permission = plugin.permission || {}
            const usage = usagedisk(plugin, args, m, cmda)

            const display = fielddisk(plugin.meta?.usage)
    			.map(({ name }) => `<${name}>`)
    			.join(' ')

            const fill = text => text
                .replace(/@cmd/g, cmda)
                .replace(/@args/g, display)
                .replace(/@example/g, plugin.meta?.description || 'a command')

            const cost = Number(plugin.limit) || 0
            const amount = cost < 0 ? -cost : 0
            const limit = Number(user.limit) || 0
            const limitCek = amount > 0 && !isOwner

            if (!client.public && !m.key.fromMe && !isOwner) return
            if (!isCooldown(plugin, m, client)) return
            if (user.Banned === -1 || user.Banned > Date.now()) return hmp(mess.banned, m, client)
            if (user.Banned) user.Banned = 0
            if (isExpired(plugin.expire)) {
                return hmp(mess.unavailable, m, client)
            }

            let groupInfo = {
                isAdmins: false,
                isBotAdmins: false
            }

            if (m.isGroup && (permission.admin || permission.botadmin)) {
                const metadata = await client.groupMetadata(m.chat)
                groupInfo = getGroupAdmins(metadata.participants, m, botLid)
            }

            const owner_lvl = permission.owner === 'real' ? isReal : isOwner

const rules = [
    [permission.group && !m.isGroup, mess.group],
    [permission.owner === 'real' && !isReal, mess.owner_nowey],
    [permission.owner === 'access' && !isOwner, mess.owner],
    [permission.owner === true && !isOwner, mess.owner],
    [permission.private && m.isGroup, mess.private],
    [permission.premium && !isPremium, mess.premium],
    [permission.admin && !groupInfo.isAdmins, mess.admin],
    [permission.botadmin && !groupInfo.isBotAdmins, mess.botAdmin]
]

            for (const [trigger, msg] of rules) {
                if (trigger) return hmp(msg, m, client)
            }

            if (plugin.meta?.target === 'reply' && !m.quoted) {
                return client.sendMessage(m.chat, {
                    image: FileU.read('./data/@etc/tutorial/reply.jpg'),
                    caption: fill(mess.reply)
                }, {
                    quoted: m
                })
            }

            if (plugin.meta?.target === 'tag' && !m.mentionedJid?.length) {
                return hmp(fill(mess.tag), m, client)
            }

            if (plugin.meta?.target === 'both' && !m.quoted && !m.mentionedJid?.length) {
                return hmp(fill(mess.reply_or_tag.replace("@cmd", command).replace("@args", "@tag"), m, client))
            }

            if (antiSpam(m, cmda)) {
                banUser(user, client.parseMs('10m'))
                return hmp(mess.spam, m, client)
            }

            if (plugin.media) {
                const types = Array.isArray(plugin.media) ? plugin.media : [plugin.media]
                const valid = types.some(type => system.mime?.startsWith(`${type}/`))

                if (!valid) {
                    return hmp(mess.media.replace('@media', types.join('/')), m, client)
                }
            }

            if (usage) return hmp(usage, m, client)

            if (limitCek && limit < amount) {
                return hmp(
                    mess.limit
                        .replace('@limit', amount)
                        .replace('@limit_user', limit),
                        m, client
                )
            }

            const data = {
                ...system,
                meta: {
                    ...plugin.meta,
                    input: inputdisk(plugin.meta?.usage, args)
                },
                groupInfo,
                permission,
                aliases: plugin.aliases || [],
                cooldown: plugin.cooldown || 0
            }

            if (limitCek) user.limit = limit - amount

            try {
                const result = await start(m.text, plugin, data)

                if (result === false) {
                    if (limitCek) user.limit += amount
                    return m.reply(mess.queue)
                }

                if (result === 'queued') return m.reply(mess.wait)
                if (result === 'dupe') return

                user.hitcmd++
            } catch (err) {
                if (limitCek) user.limit += amount
                throw err
            }
        } catch (err) {
            log.error(`Plugin error: .${system?.command || 'unknown'} ≥`, err)
        }
    })()
})
