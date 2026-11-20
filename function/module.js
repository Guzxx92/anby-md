/*₊ ────୨──── 𖦹🍀୭˚.───୨────
         INI ASSIGN MODULE 

> mempermudah pemanggilan module (also makan banyak ram, idle: 100mb)
*───────── 𖦹🍀୭˚.────୨────*/

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import cron from 'node-cron'
import crypto from 'node:crypto'
import os from 'node:os'
import { tmpdir } from 'node:os'
import util from 'node:util'
import { spawn, fork, exec, execFileSync } from 'node:child_process'
import axios from 'axios'
import ff from 'fluent-ffmpeg'
import * as webp from 'node-webpmux'
import chalk from 'chalk'
import * as cheerio from 'cheerio'
import moment from 'moment-timezone'
import chokidar from 'chokidar'
import osu from 'node-os-utils'
import * as downloader from 'btch-downloader'
import { performance } from 'node:perf_hooks'
import { fileURLToPath, pathToFileURL } from 'node:url'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import stringSimilarity from 'string-similarity'
import { Boom } from '@hapi/boom'
import makeWAclient, * as baileys from 'baileys'
import { Subject } from 'rxjs'
import gradient from 'gradient-string'
import { match, P } from 'ts-pattern'
import * as readline from 'node:readline'

Object.assign(global, {
    fs,
    fsp,
    path,
    cron,
    os,
    tmpdir,
    util,
    spawn,
    fork,
    exec,
    axios,
    ff,
    webp,
    chalk,
    cheerio,
    moment,
    chokidar,
    osu,
    downloader,
    performance,
    fileURLToPath,
    pathToFileURL,
    pino,
    qrcode,
    stringSimilarity,
    makeWAclient,
    gradient,
    match,
    P,
    readline,
    Subject,
    execFileSync,
    ...baileys
})

global.Boom = Boom
global.command$ = new Subject()
global.Crypto = crypto
//₊ ──────୨────────── 𖦹🍀୭˚.─────────୨────