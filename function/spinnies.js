const logs = new Map()
const panel = !!process.env.P_SERVER_UUID

export const Spinn = {
    start(text, id = 'status') {
        logs.set(id, text)
        process.stdout.write(panel ? `${text}\n` : text)
    },
    update(text, id = 'status') {
        if (logs.get(id) === text) return
        logs.set(id, text)
        process.stdout.write(panel ? `${text}\n` : `\r\x1b[2K${text}`)
    },
    stop(id = 'status') {
        logs.delete(id)
        if (!panel) process.stdout.write('\r\x1b[2K')
    }
}

export const Spinnup = {
    warn: (msg, ...args) => Spinn.update(`${chalk.black.bgYellow(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} ${msg}`, ...args),
    success: (msg, ...args) => Spinn.update(`${chalk.black.bgGreen(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} ${msg}`, ...args),
    error: (msg, ...args) => Spinn.update(`${chalk.black.bgRed(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} ${msg}`, ...args),
    info: (msg, ...args) => Spinn.update(`${chalk.black.bgBlue(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} ${msg}`, ...args)
}

global.Spinn = Spinn
global.Spinnup = Spinnup