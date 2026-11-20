export default {
    command: ['cekid', 'listgroup'],
    permission: {
	    owner: true
    },
    meta: {
        category: "group",
    },
    run: async ({
        client,
        command,
        m
    }) => {
    	if (command === 'cekid') return m.reply('🔥 *Id chat:* ' + m.chat)
        const groups = await client.groupFetchAllParticipating()
        const groupList = Object.values(groups)

        let teks = `*Group Chat*\n\nTotal: ${groupList.length} Group\n\n`

        for (const metadata of groupList) {
            teks +=
`•─꒰⁠⑅⁠ᵕ - ᵕ⁠꒱⁠˖⁠♡─⟢ *${metadata.subject}* ─── ──.
🪭 *ID* : ${metadata.id}
📅 *DATE* : ${metadata.creation
    ? moment(metadata.creation * 1000).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')
    : '-'}
🎀 *MEMBER* : ${metadata.participants.length}\n\n`
        }

        await m.reply(teks)
    }
}