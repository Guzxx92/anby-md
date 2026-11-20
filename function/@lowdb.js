import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

/*₊ ────୨─────── 𖦹🍀୭˚.───୨───────
            INI LOADER DATABASE
*──────────── 𖦹🍀୭˚.────୨───────*/

const meta = import.meta.dirname
const folder = path.join(meta, '../data')
const data_center = path.join(folder, 'database.json')

if (!FileU.exists(folder)) await FileU.mkdir(folder)
if (!FileU.exists(data_center)) await FileU.write(data_center, '{}')

// *₊ ────୨─────── 𖦹🍀୭˚.───୨─────── //
const fill = (t = {}, d) => Object.assign(t, { ...d, ...t })
const adapter = new JSONFile(data_center)
const datacomb = {
    users: {},
    chats: {},
    database: {},
    game: {},
    settings: {},
    others: {},
    sticker: {}
}

const userdata = (owner = false) => ({
    Owner: owner,
    Banned: 0,
    Premium: owner !== false,
    hitcmd: 0,
    mute: false,
    limit
})

const chatdata = {
    mute: false,
    group_participants: false,
    welcome: set.welcome,
    goodbye: set.goodbye,
    demote: set.demote,
    promote: set.promote,
    leveling: true,
    levels: {},
    groupLevel: {
        level: 0
    }
}

const settingdata = {
    syuen: 'not syuen',
    autoread: true
}
// *₊ ────୨─────── 𖦹🍀୭˚.───୨─────── //

await Spinnup.info('Wait, loading a database...')

global.db ??= new Low(adapter, datacomb)

global.loaddatabase = async () => {
    if (global.db.READ) return

    global.db.READ = true

    try {
        await global.db.read()

        global.db.data ||= {}
        for (const [key, value] of Object.entries(datacomb)) {
            global.db.data[key] ||= value
        }

        await global.db.write()
    } finally {
        global.db.READ = false
    }
}

await global.loaddatabase()

export const database_loader = async (m, botLid) => {
    const { users, chats, settings } = global.db.data

    const user = users[m.sender] = fill(users[m.sender], userdata())
    if (!Number.isFinite(user.hitcmd)) user.hitcmd = 0
    if (!Number.isFinite(user.limit)) user.limit = limit

    Object.assign(users[botLid] = fill(users[botLid], userdata('real')), { Owner: 'real', Premium: true })

    settings[botLid] = fill(settings[botLid], settingdata)

    if (m.isGroup) chats[m.chat] = fill(chats[m.chat], structuredClone(chatdata))
}

let writing = Promise.resolve()
global.saveDB = () => (writing = writing.then(() => global.db.write()).catch(e => Spinnup.error('Save database error:', e)))

global.dbCron?.stop()
global.dbCron = cron.schedule('*/5 * * * *', async() => await global.saveDB())