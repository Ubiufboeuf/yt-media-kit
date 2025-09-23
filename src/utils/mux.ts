import { spawnAsync } from './spawnAsync'
import { errorHandler } from './errorHandler'
import { Rutas } from 'src/lib/constants'
import { readdir } from 'node:fs/promises'
import { getVideoSize } from './videoMetadata'

export async function mux (ytId: string) {
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

  const audioDescargado = audios.find((file) => file.includes(ytId))
  
  let resolution: number = 0
  try {
    const size = await getVideoSize(`${Rutas.videos_descargados}/${videoDescargado}`)
    resolution = size?.height ?? 0
  } catch (err) {
    errorHandler(err, 'Error consiguiendo la resolución del video descargado')
  }
  
  const ffmpegParams = ['-i', `${Rutas.videos_descargados}/${videoDescargado}`, '-i', `${Rutas.audios_descargados}/${audioDescargado}`, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'libopus', '-strict', 'experimental', '-shortest', `${Rutas.videos_con_audio}/[${resolution}p]-${ytId}.mp4`]

  try {
    await spawnAsync('ffmpeg', ffmpegParams)
  } catch (err) {
    errorHandler(err, 'Error uniendo video con audio')
  }
}
