import { GoogleGenAI } from '@google/genai'

const pathh = new URL('.', import.meta.url).pathname
const ROOT = path.resolve(pathh, '../../../')
const ignore = ['node_modules', 'session']
const plugin = ['plugins', 'function/plugins']
const lines = []
const walk = (dir, prefix = '') => {
    const items = fs.readdirSync(dir, {
            withFileTypes: true
        })
        .filter(i => !ignore.includes(i.name))
    items.forEach((item, i) => {
        const isLast = i === items.length - 1
        const pointer = isLast ? '└─ ' : '├─ '
        const full = path.join(dir, item.name)
        const rel = path.relative(ROOT, full)
        lines.push(prefix + pointer + item.name)
        if (
            item.isDirectory() &&
            !plugin.includes(rel.replace(/\\/g, '/'))
        ) {
            walk(
                full,
                prefix + (isLast ? '   ' : '│  ')
            )
        }
    })
}

lines.push(path.basename(ROOT) + '/')
walk(ROOT)

export default {
    command: 'fairy',
    cooldown: 4000, 
    meta: {
        category: 'ai',
        description: 'agent 01',
        usage: '<text>'
    }, 
    premision: {
        owner: true
    },
    run: async ({
        m,
        meta,
        args,
        client
    }) => {
        const ai = new GoogleGenAI({
            apiKey: api.gemini
        });
        const pkg = fs.readFileSync('./package.json', 'utf8')
        const tree = lines.join('\n')
        const prompt = fs.readFileSync('./@prompt/fairy.txt', 'utf8')
            .replace('#PACKAGE', pkg)
            .replace('#TREE', tree)
        const json = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: args.join(' '),
            config: {
                systemInstruction: prompt,
                responseMimeType: 'application/json'
            },
        });
        
        const reply = (some) => {
        return client.sendMessage(m.chat, {
                image: fs.readFileSync('./fairy.jpg'),
                caption: some,
                ai: false
            }, {
                quoted: m,
            })
        }
       
        const res = JSON.parse(json.text)
res.code = res.code.replace(/^(?:\s*(?:const|let|var)\s+.*?\s*=\s*(?:await\s+)?import\(['"].*?['"]\)|\s*import\s+.*|.*\brequire\(['"].*?['"]\).*)\s*;?\s*$/gm, '')
console.log(res)
        
        if (res.type == 'chat') {
            reply(res.message || res.code)
        } else if (res.type == 'eval') {
            try {
                const mod = await import(`data:text/javascript,${encodeURIComponent(res.code.trim())}`)
                await reply(res.message)
            } catch (e) {
                console.log(e)
            }
        } else if (res.type == 'exec') {
            exec(res.code, (err, stdout) => {
                if (err) return console.log(String(err))
                if (stdout) reply(res.message)
            })
        } else if (res.type == 'cmd') {
            plugin.run(res.code)
        }
    } // run a fuckin CODEEEE
}
