import { Createsvg } from '../../svg.js'

export default async function (update, client) {
  const num = j => j?.split('@')[0].split(':')[0]
  const { id, participants, action } = update
  
  if (!id || !participants?.length || !action) return
 
  const bot = [client.user.id, client.user.lid].filter(Boolean).map(num)
  const isBot = p => bot.includes(num(p.id)) || bot.includes(num(p.phoneNumber))
  const key = `${id}:${action}:${participants.map(p => p.id).join(',')}`
  
  if (global.participant.has(key)) return
  if (participants.some(isBot)) {
    const wuv_u = {
      promote: async () => mess.bot.promote,
      demote: async () => mess.bot.demote,
      remove: async () => null
    }

    const text = await wuv_u[action]?.()
    if (text) await client.sendMessage(id, { text })
    return
  }
  
  if (!global.db.data.chats[id]?.group_participants) return

  const { welcome, goodbye, promote, demote } = global.db.data.chats[id]
  const meta = await client.groupMetadata(id)
  const groupname = meta.subject
  const groupdesc = meta.desc || '-'
  const unduh = async (url) => Buffer.from(await (await fetch(url)).arrayBuffer())
  const noname = pickRandom(["anonymous", "~", "someone"])
  const url = [
    'https://cdn.jsdelivr.net/gh/Guzxx92/database@main/background/2.jpeg',
    'https://cdn.jsdelivr.net/gh/Guzxx92/database@main/background/4.jpeg',
    'https://cdn.jsdelivr.net/gh/Guzxx92/database@main/background/5.jpeg',
  ]

  const templateInfo = (text, user) => text
    .replace(/@user/gi, `@${user.id.split('@')[0]}`)
    .replace(/@group/gi, groupname)
    .replace(/@desc/gi, groupdesc)

  const chatdb = global.db.data.chats[id]

  for (const user of participants) {
    const message = match(action)
      .with('add', () => templateInfo(welcome, user))
      .with('remove', () => templateInfo(goodbye, user))
      .with('promote', () => templateInfo(promote, user))
      .with('demote', () => templateInfo(demote, user))
      .otherwise(() => null)

    if (!message) continue
	if (action !== 'add' && action !== 'remove') {
      await client.sendMessage(id, { text: message, mentions: [user.id] })
      continue
    }
    
    const userdata = chatdb.levels?.[user.id]
    const level = String(userdata?.level || 1).padStart(2, '0')
    const url_bg = url[Math.floor(Math.random() * url.length)]
    const url_pp = await client.profilePictureUrl(user.id, 'image').catch(() => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')
    const [bg, pp] = await Promise.all([unduh(url_bg), unduh(url_pp)])
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <clipPath id="bulat"><circle cx="97.5" cy="156.5" r="35.5" /></clipPath>
  </defs>

  <image href="@bg" x="0" y="0" width="800" height="450" preserveAspectRatio="xMidYMid slice" />

  <image href="./data/svg/welcome.png" x="0" y="0" width="800" height="450" preserveAspectRatio="xMidYMid slice" />

  <image href="@pp" x="62" y="121" width="71" height="71"
  preserveAspectRatio="xMidYMid slice" clip-path="url(#bulat)" />

  <teks x="32" y="40" size="20" fill="white">${level}</teks>
  <teks x="719" y="298" size="18" fill="black">01</teks>
  <teks x="145" y="167" size="31" anchor="start" fill="white">${user.name || "anonymous"}</teks>
</svg>
`

    const hasil = await Createsvg(svg, { gambar: { bg, pp }, width: 1280 })
    await client.sendMessage(id, {
      image: hasil,
      caption: message,
      contextInfo: { mentionedJid: [user.id] }
    })
  }
}
