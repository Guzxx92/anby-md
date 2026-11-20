export default {
    command: ['editsubjek', 'editdesk'],
    permission: {
	    group: true,
	    botadmin: true,
	    admin: true
    },
    meta: {
        category: "group", 
        usage: '<text>'
    },
    run: async ({ client, m, command }) => {
        const syueen = m.text.slice(m.text.indexOf(' ')+1).trim()

        if (command == 'editsubjek') {
            await client.groupUpdateSubject(m.chat, syueen)
            m.reply(mess.success)
        } else if (command == 'editdesk') {
            await client.groupUpdateDescription(m.chat, syueen)
            m.reply(mess.success)
        }       
    }
}