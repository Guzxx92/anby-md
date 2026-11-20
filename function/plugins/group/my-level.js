import { Createsvg } from '../../svg.js'

export default {
    command: "rank",
    aliases: ["level", "xp"],
    meta: {
        category: "group",
        description: "Melihat level pengguna"
    },
    permission: {
        group: true
    },
    run: async ({ m, client, chatdb }) => {
        const id = m.mentionedJid?.[0] || m.sender
        const user = chatdb.levels[id]
        if (!user) return 

        const url = await client.profilePictureUrl(id, 'image').catch(() =>  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png')
        const foto = Buffer.from(await (await fetch(url)).arrayBuffer())

        const level = String(user.level).padStart(2, '0')
        const needed = 5 * user.level ** 2 + 50 * user.level + 100

        const svg = `
<svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
  <image href="./data/svg/level.png" x="0" y="0" width="800" height="450" preserveAspectRatio="xMidYMid slice" />
  <defs>
    <clipPath id="bulat1"><circle cx="400.5" cy="276.5" r="92.5" /></clipPath>
  </defs>
  <image href="@foto" x="308" y="184" width="185" height="185"
    preserveAspectRatio="xMidYMid slice" clip-path="url(#bulat1)" />
  <teks x="32" y="40" size="20" anchor="middle" fill="white">${level}</teks>
</svg>
`
		const hasil = await Createsvg(svg, { gambar: { foto }, width: 1280 })

        const caption =
            `🏆 *USER RANK - VIEW*\n` +
            `⚡ • User: @${id.split('@')[0]}\n` +
            `🌟 • Level: ${level}\n` +
            `✨ • XP: ${user.xp}/${needed}\n` +
            `🍓 • Progress: ${Math.floor(user.xp / needed * 100)}%`

        await client.sendMessage(m.chat, { image: hasil, caption, mentions: [id] }, { quoted: m })
    }
}