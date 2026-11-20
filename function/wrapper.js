/*₊ ────୨──── 𖦹🍀୭˚.───୨────
              INI WRAPPER
          
> agar mempermudah lu bikin kode agar lu ga confusing dan lupa cara salah satu module bekerja.
*───────── 𖦹🍀୭˚.────୨────*/

global.FileU = {
    remove: claw => fsp.rm(claw, { force: true, recursive: true }),
    mkdir: claw => fsp.mkdir(claw, { recursive: true }),
    readdir: claw => fs.readdirSync(claw, { withFileTypes: true }),
    copy: (src, dest) => fsp.copyFile(src, dest),
    rename: (src, dest) => fsp.rename(src, dest),
    exists: claw => fs.existsSync(claw),
    isFile: claw => fs.existsSync(claw) && fs.statSync(claw).isFile(),
    isDir: claw => fs.existsSync(claw) && fs.statSync(claw).isDirectory(),
    read: (claw, encoding = null) => fs.readFileSync(claw, encoding),
    write: (claw, data, options) => fsp.writeFile(claw, data, options)
}

global.Fetch = {
    get: async (url, options = {}) => {
        try {
            const { data } = await users.get(url, options)
            return data
        } catch (err) {
            return { error: true, message: err.message }
        }
    },
    post: async (url, payload = {}, options = {}) => {
        try {
            const { data } = await users.post(url, payload, options)
            return data
        } catch (err) {
            return { error: true, message: err.message }
        }
    }
}

global.Json = {
    format: async (string) => { 
        return JSON.stringify(string, null, 2)
    }
}
