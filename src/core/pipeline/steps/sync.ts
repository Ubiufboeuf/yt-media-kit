import chalk from 'chalk'
import { readdir, rename, unlink } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import type { Video } from 'src/core/process'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { mux } from 'src/utils/mux'

export async function muxVideoAndAudio (ytId: string, video: Video) {
  const { forceSync } = video.options
  const { maxResolutionToDownload } = video
  
  let videosConAudio: string[] = []
  try {
    videosConAudio = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos con audio')
  }

  const videoConAudio = videosConAudio.find((file) => file.includes(ytId))

  if (!videoConAudio) {
    await mux(ytId)
    return
  }

  const match = videoConAudio.match(/\[(.+)\]/)
  const resolucionGuardada = match?.[1]

  if (
    (resolucionGuardada !== maxResolutionToDownload.download) ||
    (resolucionGuardada === maxResolutionToDownload.download && forceSync)
  ) {
    // Si la resolución guardada es diferente a la que quiere el usuario, o
    // si son iguales pero fuerza, entonces:

    const ext = extname(videoConAudio)
    const slug = basename(videoConAudio, ext)

    // 1. Renombra el video viejo
    await rename(`${Rutas.videos_con_audio}/${videoConAudio}`, `${Rutas.videos_con_audio}/${slug}.old${ext}`)
    
    // 2. Consigue el nuevo video
    await mux(ytId)

    // 3. Borra el viejo si se consiguió el nuevo
    videosConAudio = await readdir(Rutas.videos_con_audio)
    if (videosConAudio.some((file) => file.includes(ytId) && !file.includes('.old'))) {
      await unlink(`${Rutas.videos_con_audio}/${slug}.old${ext}`)
    }
  }

  if (resolucionGuardada === maxResolutionToDownload.download && !forceSync) {
    console.log(chalk.gray('\n(Ya existe el video, omitiendo)'))
  }
}

export async function demuxVideoAndAudio (ytId: string) {
  let videos: string[] = []
  try {
    videos = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos descargados')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const videoConAudio = videos.find((file) => file.includes(ytId))
  // const ffmpegParams = ['-i', videoConAudio]
}
