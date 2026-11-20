export async function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  const tmp = path.join(import.meta.dirname, '../data/trash', `${Date.now()}.${ext}`)
  const out = `${tmp}.${ext2}`

  await FileU.write(tmp, buffer)

  return new Promise((resolve, reject) => {
    const process = spawn('ffmpeg', ['-y', '-i', tmp, ...args, out])

    const cleanup = async () => {
      await FileU.remove(tmp).catch(() => {})
    }

    process.on('error', async (err) => {
      await cleanup()
      await FileU.remove(out).catch(() => {})
      reject(err)
    })

    process.on('close', async (code) => {
      await cleanup()

      if (code !== 0) {
        await FileU.remove(out).catch(() => {})
        return reject(new Error(`FFmpeg exited with code: ${code}`))
      }

      try {
        const data = await FileU.read(out)
        resolve({
          data,
          filename: out,
          delete: () => FileU.remove(out).catch(() => {})
        })
      } catch (err) {
        reject(err)
      }
    })
  })
}

export function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '64k',
    '-ar', '48000',
    '-ac', '1'
  ], ext, 'ogg')
}

export function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus')
}

export function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4')
}

export function toMp3(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libmp3lame',
    '-b:a', '192k'
  ], ext, 'mp3')
}

export function toImg(buffer, ext) {
  return ffmpeg(buffer, [
    '-vcodec', 'png'
  ], ext, 'png')
}

export default {
  toAudio,
  toPTT,
  toMp3,
  toImg,
  toVideo,
  ffmpeg,
}
