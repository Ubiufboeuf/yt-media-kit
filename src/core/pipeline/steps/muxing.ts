import chalk from 'chalk'
import { readdir, rename, unlink } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import type { Video } from 'src/core/process'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { spawnAsync } from 'src/utils/spawnAsync'
import { getVideoSize } from 'src/utils/videoMetadata'

export async function muxVideoAndAudio (ytId: string, video: Video) {
  const { forceSync } = video.options
  
  let videosConAudio: string[] = []
  try {
    videosConAudio = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyeno la carpeta de videos con audio')
  }

  const videoConAudio = videosConAudio.find((file) => file.includes(ytId))

  if (forceSync && videoConAudio) {
    if (
      videosConAudio.some((file) => file.includes(`${ytId}.old`)) &&
      videosConAudio.some((file) => file.includes(`${ytId}.`) && !file.includes('.old'))
    ) {
      // Existe un .old y otro no .old del mismo video
      const oldVideoFile = videosConAudio.find((file) => file.includes(`${ytId}.old`))
      await unlink(`${Rutas.videos_con_audio}/${oldVideoFile}`)
    }
    
    const baseName = basename(videoConAudio, extname(videoConAudio))
    await rename(`${Rutas.videos_con_audio}/${videoConAudio}`, `${Rutas.videos_con_audio}/${baseName}.old.mp4`)
  } else if (videoConAudio) {
    console.log(chalk.gray('(Ya existe el video con audio, omitiendo)'))
    return
  }

  let videos: string[] = []
  try {
    videos = await readdir(Rutas.videos_descargados)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos descargados')
  }

  const videoDescargado = videos.find((file) => file.includes(ytId))

  let audios: string[] = []
  try {
    audios = await readdir(Rutas.audios_descargados)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de audios descargados')
  }

  let resolution: number = 0
  try {
    const size = await getVideoSize(`${Rutas.videos_descargados}/${videoDescargado}`)
    resolution = size?.height ?? 0
  } catch (err) {
    errorHandler(err, 'Error consiguiendo la resolución del video descargado')
  }

  const audioDescargado = audios.find((file) => file.includes(ytId))
  const ffmpegParams = ['-i', `${Rutas.videos_descargados}/${videoDescargado}`, '-i', `${Rutas.audios_descargados}/${audioDescargado}`, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'libopus', '-strict', 'experimental', '-shortest', `${Rutas.videos_con_audio}/[${resolution}p]-${ytId}.mp4`]

  try {
    await spawnAsync('ffmpeg', ffmpegParams)
  } catch (err) {
    errorHandler(err, 'Error uniendo video con audio')
  }

  videosConAudio = await readdir(Rutas.videos_con_audio)
  const videoSlug = `[${resolution}p]-${ytId}`
  if (videosConAudio.includes(`${videoSlug}.mp4`)) {
    if (videosConAudio.includes(`${videoSlug}.old.mp4`)) {
      await unlink(`${Rutas.videos_con_audio}/${`${videoSlug}.old.mp4`}`)
    }
  }
}

export async function demuxVideoAndAudio (ytId: string) {
  let videos: string[] = []
  try {
    videos = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos descargados')
  }

  const videoConAudio = videos.find((file) => file.includes(ytId))
  // const ffmpegParams = ['-i', videoConAudio]
}
