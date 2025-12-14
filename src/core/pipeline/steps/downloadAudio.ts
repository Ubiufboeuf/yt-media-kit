import { spawnAsync } from '../../../utils/spawnAsync'
import { getSizeInMiB } from '../../../utils/getSizeInMiB'
import { readdirSync } from 'node:fs'
import { Rutas } from 'src/lib/constants'
import chalk from 'chalk'
import { download } from 'src/utils/download'
import { type Video } from 'src/core/video'
import { rename, unlink } from 'node:fs/promises'

export async function getAudioId (videoId: string) {
  const ytDlpParams = ['-F', `https://www.youtube.com/watch?v=${videoId}`]
  const ytDlpOutput = await spawnAsync('yt-dlp', ytDlpParams, false)
  const lines: string[] = []
  const hasOriginal = ytDlpOutput.includes('original')

  for (const line of ytDlpOutput.split('\n')) {
    if (line.includes('images') || line.includes('[youtube]') || line.includes('[info]') || line.includes('---') || line.includes('ID') || line.trim() === '') continue
    const cleanedLine = line.replaceAll(/\s+/g, ' ').trim()
    lines.push(cleanedLine)
  }

  const best_id = { id: '', size: '', sizeInMiB: 0, tbr: '', tbrNumber: 0 }

  for (const line of lines) {
    if (hasOriginal && !line.includes('original')) continue
    
    const [part1, part2, part3] = line.split('|').map((p) => p.trim())
    if (!part1 || !part2 || !part3) continue
    
    const [id, , res] = part1.split(' ')
    const size = part2.split(' ')[part2.includes('~') ? 1 : 0]
    
    let audioOnly = false
    let videoOnly = false
    
    if (part3.includes('audio only')) audioOnly = true
    if (part3.includes('video only')) videoOnly = true

    if (videoOnly || !audioOnly) continue

    const sizeInMiB = getSizeInMiB(size)
  
    if (res === 'audio only' || audioOnly) {
      if (!best_id.id || best_id.sizeInMiB < sizeInMiB || (best_id.sizeInMiB === sizeInMiB)) {
        best_id.id = id
        best_id.size = size
        best_id.sizeInMiB = sizeInMiB
      }
    }
  }
  
  return best_id.id
}

export async function descargarAudio (video: Video) {
  const { ytId: videoId, options: { forceDownloadAudio: forceDownload } } = video

  const audiosPorProcesar = readdirSync(Rutas.audios_descargados)
  const existeAudio = audiosPorProcesar.some((f) => f.includes(videoId))

  if (!forceDownload && existeAudio) {
    console.log(chalk.gray('\n(Ya existe el audio, omitiendo)'))
    return
  }

  if (forceDownload && existeAudio) {
    await rename(`${Rutas.audios_descargados}/${videoId}.m4a`, `${Rutas.audios_descargados}/${videoId}.old.m4a`)
  }

  await download('audio', video)

  const audios = readdirSync(Rutas.audios_descargados)
  if (audios.includes(`${videoId}.aac`) && audios.includes(`${videoId}.old.aac`)) {
    await unlink(`${Rutas.audios_descargados}/${videoId}.old.aac`)
  }
}
