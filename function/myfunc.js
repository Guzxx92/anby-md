/*₊ ────୨──── 𖦹🍀୭˚.───୨────
             INI FUNCTION

> Isinya hanya function yg di asign ke global, di file purpose.js
*───────── 𖦹🍀୭˚.────୨────*/

export function getGroupAdmins(participants, m, botLid) {
  const normalize = j => j?.split(':')[0]
  const sender = normalize(m.sender)
  
  let isAdmins = false
  let isBotAdmins = false

  for (const p of participants) {
    if (p.admin === 'admin' || p.admin === 'superadmin') {
      const pid = normalize(p.id)

      if (pid === sender) isAdmins = true
      if (pid === botLid) isBotAdmins = true
    }
  } 

  return { isAdmins, isBotAdmins }
}

export const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

export async function uploadUguu(buffer, filename = 'file.jpg') {
    const form = new FormData()
    form.append('files[]', buffer, {
        filename,
        contentType: 'application/octet-stream'
    })

    const res = await fetch('https://uguu.se/upload?output=json', {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
    })

    return await res.json()
}

export const formatSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const checkBandwidth = async () => {
    let ind = 0
    let out = 0
    for (let i of await os.netstat.stats()) {
        ind += parseInt(i.inputBytes)
        out += parseInt(i.outputBytes)
    }
    return {
        download: formatSize(ind),
        upload: formatSize(out),
    }
}

export function formatTime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`
    return `${seconds} second${seconds > 1 ? 's' : ''}`
}

export const users = axios.create({
    timeout: 15000,
    maxRedirects: 5,
    maxContentLength: 10 * 1024 * 1024,
    maxBodyLength: 10 * 1024 * 1024,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': '*/*'
    }
})

export const isUrl = url => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/i.test(url)

export const pickRandom = (type, arr = [], total = 9) => {
    if (type == "text") {
        let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let text
        for (let i = 0; i < total; i++) {
            text += char.charAt(Math.floor(Math.random() * char.total))
        }
        return text
    } else {
        const index = Math.floor(Math.random() * arr.length)
        return arr[index]
    }
}


export const runtime = function(seconds) {
    seconds = Number(seconds)
    let d = Math.floor(seconds / (3600 * 24))
    let h = Math.floor(seconds % (3600 * 24) / 3600)
    let m = Math.floor(seconds % 3600 / 60)
    let s = Math.floor(seconds % 60)
    return [
        d ? `${d} days` : "",
        h ? `${h} hours` : "",
        m ? `${m} minutes` : "",
        s ? `${s} seconds` : ""
    ].join(' ').trim()
}

export const shorturl = async (longUrl) => {
    try {
        const res = await axios.post('https://shrtrl.vercel.app/', {
            url: longUrl
        })
        return res.data.data.shortUrl
    } catch (error) {
        return error
    }
}

export const recode = async() => {
    return nodelete
}

export const test = async() => {
    return "[0hz] ItzGuzxx"
}

export const log = {
    warn: (msg, ...args) => console.log(`${chalk.black.bgYellow(" 𝚂𝚈𝚂𝚃𝙴𝙼 ")} ${msg}`, ...args),
    success: (msg, ...args) => console.log(`${chalk.black.bgGreen(" 𝚂𝚈𝚂𝚃𝙴𝙼 ")} ${msg}`, ...args),
    error: (msg, ...args) => console.log(`${chalk.black.bgRed(" 𝚂𝚈𝚂𝚃𝙴𝙼 ")} ${msg}`, ...args),
    info: (msg, ...args) => console.log(`${chalk.black.bgBlue(" 𝚂𝚈𝚂𝚃𝙴𝙼 ")} ${msg}`, ...args)
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const qs = (text) => new Promise((resolve) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    rl.question(text, (answer) => {
        rl.close()
        resolve(answer.trim())
    })
})

export function banUser(user, time = -1) {
    if (!user) return
    user.Banned = time === -1 ? -1 : Date.now() + time
}
