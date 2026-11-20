export default {
    command: ['tagall', 'hidetag'],
    meta: {
        category: "group",
        description: "tag all member"
    },
    permission: {
	    group: true
    },
    run: async ({
        client,
        m,
        command,
        text,
        meta 
    }) => {
        const metadata = await client.groupMetadata(m.chat);
        const members = metadata.participants.map(p => p.id);

        if (command == "tagall") {
            client.sendMessage(m.chat, {
                text: "@" + m.chat,
                contextInfo: {
                    groupMentions: [{
                        groupJid: m.chat,
                        groupSubject: 'everyone'
                    }],
                    mentionedJid: members
                }
            })
        } else {
            if (!text) return m.reply(mess.help
            .replace("@cmd", command)
            .replace("@args", "<text>")
            .replace("@example", meta.description) + "\n<text>" + arg.TEXT)
            client.sendMessage(m.chat, {
                text: text,
                contextInfo: {
                    groupMentions: [{
                        groupJid: m.chat,
                        groupSubject: 'everyone'
                    }],
                    mentionedJid: members
                }
            })
        }
    }
}