export default {
    command: 'autoread',
    permission: {
    	owner: true
    },
    meta: {
    	category: 'owner',
    	usage: '<on/off>'
    },
    run: async ({
        m,
        text,
        settingdb
    }) => {
        if (text === 'on') {
            if (settingdb.autoread) return m.reply(mess.fitur.on)
            settingdb.autoread = true
            return m.reply(`*${mess.change} ${text}*`)
        }
        
            if (!settingdb.autoread) return m.reply(mess.fitur.off)
            
            settingdb.autoread = false
            m.reply(`*${mess.change} ${text}*`)
    }
}