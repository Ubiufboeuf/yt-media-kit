import { readdir } from 'node:fs/promises'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { spawnAsync } from 'src/utils/spawnAsync'

export async function muxVideoAndAudio (ytId: string) {
  let videosConAudio: string[] = []
  try {
    videosConAudio = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyeno la carpeta de videos con audio')
  }

  const videoConAudio = videosConAudio.find((file) => file.includes(ytId))

  if (videoConAudio) return
  
  let videos: string[] = []
  try {
    videos = await readdir(Rutas.videos_descargados)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos descargados')
  }

  const video = videos.find((file) => file.includes(ytId))

  let audios: string[] = []
  try {
    audios = await readdir(Rutas.audios_descargados)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de audios descargados')
  }

  const audio = audios.find((file) => file.includes(ytId))
  const ffmpegParams = ['-i', `${Rutas.videos_descargados}/${video}`, '-i', `${Rutas.audios_descargados}/${audio}`, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'libopus', '-strict', 'experimental', '-shortest', `${Rutas.videos_con_audio}/${ytId}.mp4`]

  try {
    await spawnAsync('ffmpeg', ffmpegParams)
  } catch (err) {
    errorHandler(err, 'Error uniendo video con audio')
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
