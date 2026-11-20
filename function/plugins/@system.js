export default {
    run: async ({
       client,
        m,
        qmsg,
        isMedia,
        userdb,
        chatdb,
        settingdb,
        runtime,
        quoted,
        itsMe,
        username,
        botLid,
        mime,
        isOwner,
        isPremium
    }) => {
    
    if (m && settingdb.autoread) client.readMessages([m.key])
    
    }
}