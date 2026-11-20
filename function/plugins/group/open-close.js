const timers = new Map()
const parsers = text => {
    const match = text.trim().match(/^(\d+)(s|m|h)$/i)
    if (!match) return null
    const n = Number(match[1])
    const ms = n * ({ s: 1000, m: 60000, h: 3600000 }[match[2].toLowerCase()])
    return n > 0 && ms <= 86400000 ? ms : null
}

const format = (ms, id) => {
    if (ms >= 3600000) return `${ms / 3600000} ${id ? 'jam' : 'hours'}`
    if (ms >= 60000) return `${ms / 60000} ${id ? 'menit' : 'minutes'}`
    return `${ms / 1000} ${id ? 'detik' : 'seconds'}`
}

export default {
    command: ['opengc', 'closegc'],
    permission: { 
    	group: true, 
    	admin: true, 
    	botadmin: true 
    },
    meta: {
        category: 'group',
        description: 'Open or close group with countdown timer',
        usage: '[time]'
    },
    run: async ({ client, m, command, text }) => {
    const id = lang === 'id' 
    const chat = m.chat
    const close = command === 'closegc'
    const action = close ? 'announcement' : 'not_announcement'
    const duration = text ? parsers(text) : null

    if (text && !duration) return m.reply(mess.ftime)

    const old = timers.get(chat)
    if (old) {
        clearTimeout(old)
        timers.delete(chat)
    }

    if (!duration) {
        try {
            await client.groupSettingUpdate(chat, action)
        } catch (e) {
            return m.reply(`*🍅 Failed:*\n${e}`)
        }
        return m.reply(mess.done)
    }

    const timer = setTimeout(async () => {
        if (timers.get(chat) !== timer) return
        try {
            await client.groupSettingUpdate(chat, action)
            await client.sendMessage(chat, {
                text: id
                    ? `⏰ *Waktu habis!*\n- Grup ${close ? 'ditutup' : 'dibuka'}.`
                    : `⏰ *Time has run out!*\n- Group ${close ? 'closed' : 'opened'}.`
            })
        } catch (e) {
            console.error('GC timer error:', e)
        } finally {
            if (timers.get(chat) === timer) timers.delete(chat)
        }
    }, duration)

    timers.set(chat, timer)

    return m.reply(
        id
            ? `⏳ *Grup akan ${close ? 'ditutup' : 'dibuka'} dalam ${format(duration, id)}.*`
            : `⏳ *Group will be ${close ? 'closed' : 'opened'} in ${format(duration, id)}.*`
    )
}
}