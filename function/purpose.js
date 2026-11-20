/*₊ ────୨──── 𖦹🍀୭˚.───୨────
         INI ASSIGN FUNCTION 

> mempermudah pemanggilan function (also makan banyak ram, idle: 100mb)
*───────── 𖦹🍀୭˚.────୨────*/

import {
    toAudio,
    toPTT,
    toMp3,
    toImg,
    toVideo
} from './converter.js'
import {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    writeExif,
    exifAvatar,
    addExif
} from './exif.js'
import {
    formatSize,
    checkBandwidth,
    getBuffer,
    pickRandom,
    runtime,
    shorturl,
    formatTime,
    uploadUguu,
    delay,
    isUrl,
    qs,
    log,
    banUser,
    getGroupAdmins
} from './myfunc.js'
import {
    initCrest,
    multiCrest,
    listCrest
} from './@sockets/socket.js'
import { tiktok } from './scraper/downloader.js'
import { serialize } from './@sockets/serialize.js'
import { database_loader } from './@lowdb.js'
import { flagsSocket } from './@sockets/flags.js'
import { quote } from './scraper/trend.js'
//
Object.assign(global, {
    toAudio,
    toPTT,
    toVideo,
    formatSize,
    checkBandwidth,
    getBuffer,
    isUrl,
    pickRandom,
    runtime,
    tiktok,
    shorturl,
    uploadUguu,
    log,
    qs,
    delay,
    getGroupAdmins,
    initCrest,
    serialize,
    database_loader,
    flagsSocket,
    banUser,
    quote,
    listCrest,
    imageToWebp,
    multiCrest,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    writeExif,
    exifAvatar,
    formatTime,
    addExif
})
//
global.pollCache = global.pollCache || new Map()
global.checkLoader = null
global.participant = global.participant || new Set()
//
//₊ ──────୨────────── 𖦹🍀୭˚.─────────୨────