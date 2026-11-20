const introduced = new Set()

async function introduce(client, id) {
    if (introduced.has(id)) return
    introduced.add(id)
    setTimeout(() => introduced.delete(id), 60_000)

    await new Promise(r => setTimeout(r, 3000))

    try {
        await client.sendMessage(id, {
            text: mess.bot.add
        })
    } catch (e) {
        console.log('Introduction error:', e.message)
    }
}

export default async function (update, client) {
    if (!Array.isArray(update)) return

    for (const g of update) {
        if (g?.id) await introduce(client, g.id)
    }
}