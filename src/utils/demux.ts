import { readdir } from 'node:fs/promises'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from './errorHandler'
import { spawnAsync } from './spawnAsync'

export async function demuxAudio (ytId: string) {
  let videosConAudio: string[] = []
  try {
    videosConAudio = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos con audio')
  }

  const videoConAudio = videosConAudio.find((file) => file.includes(ytId))
  
  
  const ffmpegParams = ['-i', `${Rutas.videos_con_audio}/${videoConAudio}`, '-vn', '-map', '0:a', '-c:a', 'copy', `${Rutas.audios}/${videoConAudio}`]

  try {
    await spawnAsync('ffmpeg', ffmpegParams)
  } catch (err) {
    errorHandler(err, 'Error separando audio')
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
  const ffmpegParams = ['-i', `${Rutas.videos_con_audio}/${videoConAudio}`, '-an', '-map', '0:v', '-c:v', 'copy', `${Rutas.videos}/${videoConAudio}`]

  try {
    await spawnAsync('ffmpeg', ffmpegParams)
  } catch (err) {
    errorHandler(err, 'Error separando video')
  }
}
