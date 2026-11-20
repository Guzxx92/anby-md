export default {
    command: ['totalprem', 'totalowner'],
    permission: {
	    owner: true,
    },
    meta: {
        category: 'owner',
    },
    run: async ({
        m,
        command
    }) => {
    	if (command === 'totalprem') {
        const total = Object.values(global.db.data.users)
            .filter(u => u.Premium)
            .length

        return m.reply(`*☘️ Total premium User:* ${total}`)
        }
        
        const total = Object.values(global.db.data.users)
            .filter(u => u.Owner)
            .length

        m.reply(`*👑 Total list Owner:* ${total}`)
    }
}