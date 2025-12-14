import { readdir, rename, unlink } from 'node:fs/promises'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from './errorHandler'
import { spawnAsync } from './spawnAsync'
import type { Video } from 'src/core/video'
import chalk from 'chalk'
import { extname } from 'node:path'

export async function demuxAudio (ytId: string, video: Video) {
  let videosConAudio: string[] = []
  try {
    videosConAudio = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos con audio')
  }

  const videoConAudio = videosConAudio.find((file) => file.includes(ytId))

  let audios: string[] = []
  try {
    audios = await readdir(Rutas.audios)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de audios')
  }

  const audio = audios.find((file) => file.includes(ytId))
  
  const ffmpegParams = ['-i', `${Rutas.videos_con_audio}/${videoConAudio}`, '-vn', '-map', '0:a', '-c:a', 'copy', `${Rutas.audios}/${ytId}.mp4`]

  if (audio && !video.options.forceUnsync) {
    console.log(chalk.gray('\n(Ya existe el audio, omitiendo)'))
    return    
  }

  if (audio && video.options.forceUnsync) {
    const ext = extname(audio)
    await rename(`${Rutas.audios}/${audio}`, `${Rutas.audios}/${ytId}.old${ext}`)
  }

  try {
    await spawnAsync('ffmpeg', ffmpegParams)
  } catch (err) {
    errorHandler(err, 'Error separando audio')
  }

  audios = await readdir(Rutas.audios_descargados)
  if (audios.includes(`${ytId}.aac`) && audios.includes(`${ytId}.old.aac`)) {
    await unlink(`${Rutas.audios}/${ytId}.old.aac`)
  }
}

export async function demuxVideo (ytId: string) {
  let videosConAudio: string[] = []
  try {
    videosConAudio = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos con audio')
  }

  const videoConAudio = videosConAudio.find((file) => file.includes(ytId))
  const videoConAudioBase = videoConAudio?.replace('.mp4', '.base.mp4')
  const ffmpegParams = ['-i', `${Rutas.videos_con_audio}/${videoConAudio}`, '-an', '-map', '0:v', '-c:v', 'copy', `${Rutas.videos}/${videoConAudioBase}`]

  try {
    await spawnAsync('ffmpeg', ffmpegParams)
  } catch (err) {
    errorHandler(err, 'Error separando video')
  }
}
