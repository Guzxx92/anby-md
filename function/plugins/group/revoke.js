export default {
    command: ['revoke', 'resetlinkgc'],
    meta: {
        category: "group",
    },
    permission: {
	    group: true,
	    admin: true,
	    botadmin: true
    },
    run: async ({
        client,
        m,
        command,
        text
    }) => {
        await client.groupRevokeInvite(m.chat)
        await m.reply(mess.success
        .replace("Command", "Revoke")
        )
    }
}