import chalk from 'chalk'
import { readdir, rename, unlink } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import type { Video } from 'src/core/video'
import { Rutas } from 'src/lib/constants'
import { demuxAudio, demuxVideo } from 'src/utils/demux'
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

export async function demuxVideoAndAudio (ytId: string, video: Video) {
  const { forceUnsync } = video.options

  let videosConAudio: string[] = []
  try {
    videosConAudio = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos descargados')
  }

  const videoConAudio = videosConAudio.find((file) => file.includes(ytId))

  if (!videoConAudio) {
    console.error(`No se encontró ningún video con audio para: ${ytId}`)
    return
  }

  let videosSeparados: string[] = []
  try {
    videosSeparados = await readdir(Rutas.videos)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos')
  }

  let audiosSeparados: string[] = []
  try {
    audiosSeparados = await readdir(Rutas.audios)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de audios')
  }

  const videoSeparado = videosSeparados.find((file) => file.includes(ytId))
  const audioSeparado = audiosSeparados.find((file) => file.includes(ytId))

  if (videoSeparado && audioSeparado && !forceUnsync) {
    console.log(chalk.gray('\n(Ya existen el video y el audio separados, omitiendo)'))
    return
  }

  if (videoSeparado && !forceUnsync) {
    console.log(chalk.gray('\n(Ya existe el video separado, omitiendo)'))
  }

  if (audioSeparado && !forceUnsync) {
    console.log(chalk.gray('\n(Ya existe el audio separado, omitiendo)'))
  }
  
  if (!videoSeparado) {
    await demuxVideo(ytId)
  }

  if (!audioSeparado) {
    await demuxAudio(ytId, video)
  }

  if (videoSeparado && forceUnsync) {
    const ext = extname(videoSeparado)
    const slug = basename(videoSeparado, ext)
    
    // 1. Renombra el video viejo
    await rename(`${Rutas.videos}/${videoSeparado}`, `${Rutas.videos}/${slug}.old${ext}`)
    
    // 2. Consigue (separa) el nuevo video
    await demuxVideo(ytId)

    // 3. Borra el viejo si se separó el nuevo (se espera que el renombrar de antes salió bien)
    const videos = await readdir(Rutas.videos)
    if (videos.some((file) => file.includes(ytId) && !file.includes('.old'))) {
      await unlink(`${Rutas.videos}/${slug}.old${ext}`)
    }
  }

  if (audioSeparado && forceUnsync) {
    const ext = extname(audioSeparado)
    const slug = basename(audioSeparado, ext)
    
    // 1. Renombra el audio viejo
    await rename(`${Rutas.audios}/${audioSeparado}`, `${Rutas.audios}/${slug}.old${ext}`)
    
    // 2. Consigue (separa) el nuevo audio
    await demuxAudio(ytId, video)

    // 3. Borra el viejo si se separó el nuevo (se espera que el renombrar de antes salió bien)
    const audios = await readdir(Rutas.audios)
    if (audios.some((file) => file.includes(ytId) && !file.includes('.old'))) {
      await unlink(`${Rutas.audios}/${slug}.old${ext}`)
    }
  }
}
