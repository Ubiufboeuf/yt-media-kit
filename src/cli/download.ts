import { Resolution } from '@/env'
import { CWD, YT_DLP } from '@/lib/constants'
import { readdirSync, unlinkSync } from 'node:fs'
import prompts from 'prompts'
import { oraPromise } from 'ora'
import { spawnAsync } from '@/lib/utils'

export async function downloadVideo (videoId: string, resolutions: Resolution[]) {
  // console.log('downloadVideo()', videoId, resolution)
  const audiosPorProcesar = readdirSync(`${CWD}/recursos/por_procesar/1_audios`)
  const videosPorProcesar = readdirSync(`${CWD}/recursos/por_procesar/1_videos_sin_audio`)

  const faltaAudio = !(audiosPorProcesar.some(f => f.includes(videoId)))
  const faltaVideo = !(videosPorProcesar.some(f => f.includes(videoId)))

  if (!faltaVideo && !faltaAudio) {
    return
  }

  for (const resolution of resolutions) {
    console.log(resolution)
    const ytDlpParamsVideo = ['-f', `${resolution.download}/mp4`, '-o', '%(id)s.%(ext)s', '-P', 'recursos/por_procesar/1_videos_sin_audio', `https://www.youtube.com/watch?v=${videoId}`]
    const ytDlpParamsAudio = ['-f', `${resolution.download}`, '-x', '--audio-format', 'opus', '-o', '%(id)s.%(ext)s', '-P', 'recursos/por_procesar/1_audios', `https://www.youtube.com/watch?v=${videoId}`]
    const ffmpegParamsAudio = ['-i', `recursos/por_procesar/1_audios/${videoId}.opus`, `recursos/por_procesar/1_audios/${videoId}.mp4`]

    if (faltaVideo) {
      await oraPromise(spawnAsync(YT_DLP, ytDlpParamsVideo), { text: 'Descargando video', successText: 'Video descargado' })
    }
    if (faltaAudio) {
      await oraPromise(spawnAsync(YT_DLP, ytDlpParamsAudio), { text: 'Descargando audio', successText: 'Audio descargado' })
      await oraPromise(spawnAsync('ffmpeg', ffmpegParamsAudio), { text: 'Convirtiendo audio', successText: 'Audio convertido' })
  
      const audios = readdirSync(`${CWD}/recursos/por_procesar/1_audios/`)
      if (audios.includes(`${videoId}.opus`)) {
        unlinkSync(`${CWD}/recursos/por_procesar/1_audios/${videoId}.opus`)
      }
    }
  }
}

export async function askForResolution () {
  const res = await prompts({
    name: 'value',
    message: 'Elije las resoluciones para descargar',
    type: 'multiselect',
    hint: 'Todas las opciones se descargan junto al audio',
    instructions: false,
    choices: [
      { title: 'Rendimiento (mínimo)', description: 'Descarga el video a 144p y lo deja en 32p', value: { download: '144p', desired: '32p' } },
      { title: 'Música (bajo)', description: 'Descarga el video a 144p', value: { download: '144p', desired: '144p' } },
      { title: 'Normal (medio)', description: 'Descarga el video a 360p', value: { download: '360p', desired: '360p' } },
      { title: 'Leer (alto)', description: 'Descarga el video a 720p', value: { download: '720p', desired: '720p' } },
      { title: 'Calidad (máximo)', description: 'Descarga el video a 1080p', value: { download: '1080p', desired: '1080p' } }
    ],
    min: 1
  })

  return res.value as Resolution[]
}
