export default {
    command: "leaderboard",
    aliases: ["lb", "topxp"],
    meta: {
        category: "group",
        description: "Melihat leaderboard XP grup"
    },
    permission: {
    	group: true
    },
    run: async ({ m, chatdb, client }) => {
        const top = Object.entries(chatdb.levels)
            .sort((a, b) => b[1].level - a[1].level || b[1].xp - a[1].xp)
            .slice(0, 10)

        if (!top.length) return m.reply("🏆 *GROUP LEADERBOARD*\n\n~none~")

        const mentions = top.map(([id]) => id)        
        const text = top.map(([id, user], i) =>
            `${i + 1}. @${id.split('@')[0]}\n   ⭐ Level ${user.level} (${user.xp} XP)`
        ).join("\n\n")

        await client.sendMessage(m.chat, {
        	caption: `🏆 *GROUP LEADERBOARD*\n\n${text}`,
        	image: { url: "https://cdn.jsdelivr.net/gh/Guzxx92/database@main/background/21af541c-e7a2-4cdc-a8ee-7ace2364cc19.jpeg" },
        	mentions 
        }, { quoted: m })
    }
}
