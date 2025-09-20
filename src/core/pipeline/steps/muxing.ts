import { readdir } from 'node:fs/promises';
import { Rutas } from 'src/lib/constants';
import { errorHandler } from 'src/utils/errorHandler';
import { spawnAsync } from 'src/utils/spawnAsync';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { getVideoSize } from 'src/utils/videoMetadata';

const rl = readline.createInterface({ input, output });

export async function muxVideoAndAudio (videoId: string) {
  let videosConAudio: string[] = []
  try {
    videosConAudio = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyeno la carpeta de videos con audio')
  }

  const videoConAudio = videosConAudio.find((file) => file.includes(videoId))

  if (videoConAudio) {
    let videoResolution
    try {
      videoResolution = await getVideoSize(`${Rutas.videos_con_audio}/${videoConAudio}`)
    } catch (err) {
      errorHandler(err, 'Error consiguiendo el tamaño del video')
    }

    const resolution = videoResolution ? `${videoResolution.width}x${videoResolution?.height}` : 'unknown'
    console.log({ resolution })

    // preguntar si quiere sobreescribirlo
    let answer = ''

    while (true) {
      answer = await rl.question(`Ya existe un archivo con el audio y video mezclados (${resolution}). ¿Quieres sobreescribirlo? [Y/n]`);
      const alc = answer.toLowerCase()

      console.log('answer:', answer, { answer })
      console.log('alc:', alc, { alc })
      
      if (alc === 'yes' || alc === 'no')
        break
    }

    rl.close();
    return answer === 'yes'
  }
  
  let videos: string[] = []
  try {
    videos = await readdir(Rutas.videos_descargados)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos descargados')
  }

  const video = videos.find((file) => file.includes(videoId))

  let audios: string[] = []
  try {
    audios = await readdir(Rutas.audios_descargados)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de audios descargados')
  }

  const audio = audios.find((file) => file.includes(videoId))
  const ffmpegParams = ['-i', `${Rutas.videos_descargados}/${video}`, '-i', `${Rutas.audios_descargados}/${audio}`, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'libopus', '-strict', 'experimental', '-shortest', `${Rutas.videos_con_audio}/${videoId}.mp4`]

  try {
    await spawnAsync('ffmpeg', ffmpegParams)
  } catch (err) {
    errorHandler(err, 'Error uniendo video con audio')
  }
}

export async function demuxVideoAndAudio (videoId: string) {
  let videos: string[] = []
  try {
    videos = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos descargados')
  }

  const videoConAudio = videos.find((file) => file.includes(videoId))
  // const ffmpegParams = ['-i', videoConAudio]
}