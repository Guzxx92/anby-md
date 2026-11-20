export default {
    command: 'linkgc',
    permission: {
	    group: true,
	    botadmin: true
    },
    meta: {
        category: "group"
    },
    run: async ({
        client,
        m,
        command,
        text
    }) => {
        const groupe = await client.groupMetadata(m.chat);
        const members = groupe.participants;
        const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const response = await client.groupInviteCode(m.chat)

        m.reply(`*\`[ ${groupe.subject} ]\`*\n\n*🦈 Link:* https://chat.whatsapp.com/${response}`)
    }
}