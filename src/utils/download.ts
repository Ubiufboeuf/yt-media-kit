import type { Resolution } from '../env'
import { errorHandler } from './errorHandler'
import { spawnAsync } from './spawnAsync'
import { Rutas } from '../lib/constants'
import { readdirSync, unlinkSync } from 'node:fs'
import { getResolutionId } from '../core/pipeline/steps/downloadVideo'
import { getAudioId } from '../core/pipeline/steps/downloadAudio'

export async function download (format: 'video' | 'audio', videoId: string, forceDownload: boolean, maxResToDownload: Resolution | 'audio') {
  if (format === 'video' && maxResToDownload !== 'audio') {
    let resolutionId = ''
    try {
      resolutionId = await getResolutionId(videoId, maxResToDownload.download)
    } catch (err) {
      throw errorHandler(err, '\nNo se pudo conseguir el id de la resolución')
    }
    
    const downloadParams = ['-f', `${resolutionId}/mp4`, '-o', `[${maxResToDownload.download}]-%(id)s.%(ext)s`, '-P', Rutas.videos_descargados, `https://www.youtube.com/watch?v=${videoId}`]

    try {
      await spawnAsync('yt-dlp', downloadParams)
    } catch (err) {
      throw errorHandler(err, 'Error descargando el video', false)
    }

    const videos = readdirSync(Rutas.videos_descargados)
    if (videos.includes(`${videoId}.mp4`)) {
      return true
    }
    return false

  } else if (format === 'audio' && maxResToDownload === 'audio') {
    let audioId = ''
    try {
      audioId = await getAudioId(videoId)
    } catch (err) {
      throw errorHandler(err, '\nNo se pudo conseguir el id del audio')
    }
    
    const ytDlpParamsAudio = ['-f', `${audioId}`, '-x', '--audio-format', 'opus', '-o', '%(id)s.opus', '-P', Rutas.audios_descargados, `https://www.youtube.com/watch?v=${videoId}`]

    if (forceDownload) {
      const audios = readdirSync(Rutas.audios_descargados)
      if (audios.includes(`${videoId}.mp4`)) {
        unlinkSync(`${Rutas.audios_descargados}/${videoId}.mp4`)
      }
    }

    try {
      await spawnAsync('yt-dlp', ytDlpParamsAudio)
    } catch (err) {
      throw errorHandler(err, 'Error descargando el audio', false)
    }

    const audios = readdirSync(Rutas.audios_descargados)
    if (audios.includes(`${videoId}.mp4`)) {
      return true
    }
    return false
  }

  return false
}
