import fs from 'fs'
import { createRequire } from 'module'
import opentype from 'opentype.js'
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import jpeg from 'jpeg-js'

// Codeslop (Claude ai) 
// Svg to jpeg/jpg
// Kode dan file ini di buat oleh ai, aku gbs jelasin apa² karna aku ga tau gmn kodenya bekerja, atau kalian bisa liat komentar yg di buat ama claude, ak cuma ganti log nya (´∩｡• ᵕ •｡∩`), intinya ini buat svg jadi jpg

const require = createRequire(import.meta.url)
const loadSekali = () =>
  (globalThis.__resvgWasmSiap ??= initWasm(
    fs.readFileSync(require.resolve('@resvg/resvg-wasm/index_bg.wasm'))
  ).catch((e) => {
    if (/already initialized/i.test(e?.message)) return
    delete globalThis.__resvgWasmSiap
    throw e
  }))

const cacheFont = (globalThis.__cacheFontSvg ??= new Map())
function muatFont(file) {
  if (!cacheFont.has(file)) {
    const buf = fs.readFileSync(file)
    cacheFont.set(
      file,
      opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
    )
  }
  return cacheFont.get(file)
}

// terima path file ATAU Buffer
function dataUri(sumber) {
  const buf = Buffer.isBuffer(sumber) ? sumber : fs.readFileSync(sumber)
  const mime = buf[0] === 0xff && buf[1] === 0xd8 ? 'image/jpeg' : 'image/png'
  return `data:${mime};base64,${buf.toString('base64')}`
}

function teksPath(font, teks, x, y, size, anchor = 'middle') {
  const lebar = font.getAdvanceWidth(teks, size)
  let xAwal = x
  if (anchor === 'middle') xAwal = x - lebar / 2
  if (anchor === 'end') xAwal = x - lebar
  return font.getPath(teks, xAwal, y, size).toPathData(2)
}

function parseAttr(str) {
  const attr = {}
  for (const m of str.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attr[m[1]] = m[2]
  return attr
}

export async function Createsvg(kodeSvg, opsi = {}) {
  const {
    font: fontDefault = './data/font.ttf',
    output,
    quality = 90,
    background = '#ffffff',
    width,
    gambar = {},
  } = opsi

  await loadSekali()

  // 1. href: "@nama" -> Buffer dari opsi.gambar, selain itu path file
  let svg = kodeSvg.replace(/(xlink:href|href)="([^"]*)"/g, (semua, nama, nilai) => {
    if (/^(data:|https?:|#)/.test(nilai)) return semua
    if (nilai.startsWith('@')) {
      const sumber = gambar[nilai.slice(1)]
      if (!sumber) throw new Error(`Gambar "${nilai}" tidak ada di opsi.gambar`)
      return `${nama}="${dataUri(sumber)}"`
    }
    return `${nama}="${dataUri(nilai)}"`
  })

  // 2. <teks> -> <path>
  svg = svg.replace(/<teks\b([^>]*)>([\s\S]*?)<\/teks>/g, (_, attrStr, isi) => {
    const { x = 0, y = 0, size = 32, anchor = 'middle', font: f, ...sisa } = parseAttr(attrStr)
    const d = teksPath(muatFont(f || fontDefault), isi.trim(), +x, +y, +size, anchor)
    const lain = Object.entries(sisa).map(([k, v]) => `${k}="${v}"`).join(' ')
    return `<path d="${d}" ${lain || 'fill="white"'} />`
  })

  // 3. SVG -> pixel -> JPG
  const resvg = new Resvg(svg, {
    background,
    fitTo: width ? { mode: 'width', value: width } : { mode: 'original' },
  })
  const hasil = resvg.render()
  const jpg = jpeg.encode(
    { data: hasil.pixels, width: hasil.width, height: hasil.height },
    quality
  ).data

  if (output) fs.writeFileSync(output, jpg)
  return jpg
}