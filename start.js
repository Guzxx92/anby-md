//₊ ──────୨────────── 𖦹🍀୭˚.─────────୨────
/**
 * WA Bot - Anby md (X-Legacy)
 * Copyright (C) 2026 @Guzxx92
 * Licensed GPL-3.0
 * Original Author: @Guzxx92 - wa.me/6283123448708
 * Full license: https://www.gnu.org/licenses/gpl-3.0.txt
 */
//₊ ──────୨────────── 𖦹🍀୭˚.─────────୨────

import { fork } from 'child_process'
import path from 'path'
import chalk from 'chalk'
import fs from 'fs'

import './function/spinnies.js'

const meta = import.meta.dirname
const art = path.join(meta, './data/ascii.txt')
const ascii = await fs.promises.readFile(art, 'utf8')
const node = parseInt(process.versions.node.split('.')[0], 10)
const panel = !!process.env.P_SERVER_UUID

let mama
let papa
let our_child 
let shutdown = false

async function typing(text, speed = 50) {
  for (const char of text) {
    process.stdout.write(char)
    await new Promise(r => setTimeout(r, speed))
  }
  console.log()
}

async function start() {
    our_child = fork(path.join(meta, 'function/@sockets/main.js'), [], {
        detached: true,
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })

    our_child.on('message', msg => {
        if (msg === 'reset') {
            console.log(`${chalk.black.bgYellow(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} Hold on, restarting scripts..`)
            our_child.kill()
        }

        if (msg === 'shutdown') {
            shutdown = true
            our_child.kill()
        }
    })

    our_child.on('exit', code => {
        console.log(`${chalk.black.bgRed(' 𝚂𝚈𝚂𝚃𝙴𝙼 ')} Script exited with code: ${code}`)

        if (shutdown) process.exit(0)
        if (code === 0 || process.exitCode !== undefined) return

        setTimeout(start, 1000)
    })
}

const pkg = JSON.parse(fs.readFileSync('./package.json'))
const info = `\n ${chalk.red("●")} ${chalk.yellow("●")} ${chalk.green("●")}ㅤㅤ${chalk.red('F')}${chalk.yellow('r')}${chalk.green('ee')}${chalk.blue('ze base - hotfix')}\n ${chalk.bold(`${pkg.name} ${pkg.version} - plugin. by ${pkg.author}`)}\n`

console.log(ascii.replace('@wm', chalk.blue('⛇')))
await typing(info, 20)

if (panel) console.log(" ")

await Spinn.start(`${chalk.black.bgYellow(" 𝚂𝚈𝚂𝚃𝙴𝙼 ")} Starting the script...`)

if (node < 25) {
    Spinn.update(`${chalk.black.bgRed(" 𝚂𝚈𝚂𝚃𝙴𝙼 ")} Scripts requires Node.js 25+ to run. (now: ${process.version})\n`)
    process.exit(1)
}

start()

process.on('SIGINT', () => {
    if (shutdown) return
    shutdown = true

    if (our_child?.connected && our_child.exitCode === null) {
        our_child.send('shutdown')
    } else {
        process.exit(0)
    }
})

process.on('SIGTERM', () => {
    if (shutdown) return
    shutdown = true

    if (!our_child?.connected || our_child.killed) return process.exit(0)
    our_child.send('shutdown')
})

