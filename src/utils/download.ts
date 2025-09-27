import { errorHandler } from './errorHandler'
import { spawnAsync } from './spawnAsync'
import { BUGS_PATCHES, Rutas } from '../lib/constants'
import { readdirSync, renameSync, unlinkSync } from 'node:fs'
import { getResolutionId } from '../core/pipeline/steps/downloadVideo'
import { getAudioId } from '../core/pipeline/steps/downloadAudio'
import { stringToParams } from './stringToParams'
import type { Video } from 'src/core/video'

export async function download (format: 'video' | 'audio', video: Video) {
  if (format === 'video' && video.maxResolutionToDownload) {
    const { ytId: videoId, maxResolutionToDownload: maxResToDownload } = video

    let resolutionId = ''
    try {
      resolutionId = await getResolutionId(videoId, maxResToDownload.download)
    } catch (err) {
      errorHandler(err, '\nNo se pudo conseguir el id de la resolución')
    }
    
    const downloadParams = ['-f', `${resolutionId}/mp4`, '-o', `[${maxResToDownload.download}]-%(id)s.%(ext)s`, '-P', Rutas.videos_descargados, `https://www.youtube.com/watch?v=${videoId}`]

    downloadParams.push(...stringToParams(BUGS_PATCHES.YT_DLP.extractor_args))

    try {
      await spawnAsync('yt-dlp', downloadParams)
    } catch (err) {
      errorHandler(err, 'Error descargando el video', true)
    }
  } else if (format === 'audio') {
    const { ytId: videoId } = video

    let audioId = ''
    try {
      audioId = await getAudioId(videoId)
    } catch (err) {
      errorHandler(err, '\nNo se pudo conseguir el id del audio')
    }
    
    const ytDlpParamsAudio = ['-f', `${audioId}`, '-x', '--audio-format', 'opus', '-o', '%(id)s.opus', '-P', Rutas.audios_descargados, `https://www.youtube.com/watch?v=${videoId}`]

    ytDlpParamsAudio.push(...stringToParams(BUGS_PATCHES.YT_DLP.extractor_args))

    if (forceDownload) {
      const audios = readdirSync(Rutas.audios_descargados)
      if (audios.includes(`${videoId}.opus`)) {
        renameSync(`${Rutas.audios_descargados}/${videoId}.opus`, `${Rutas.audios_descargados}/${videoId}.old.opus`)
      }
    }

    try {
      await spawnAsync('yt-dlp', ytDlpParamsAudio)
    } catch (err) {
      errorHandler(err, 'Error descargando el audio', true)
    }

    const audios = readdirSync(Rutas.audios_descargados)
    if (audios.includes(`${videoId}.opus`) && audios.includes(`${videoId}.old.opus`)) {
      unlinkSync(`${Rutas.audios_descargados}/${videoId}.old.opus`)
    }
  }
}
