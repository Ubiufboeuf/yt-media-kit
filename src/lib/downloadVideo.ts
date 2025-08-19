import { spawnAsync } from '@/utils/spawnAsync'
import type { Resolution } from '../env'
import prompts from 'prompts'
import { getSizeInMiB } from '@/utils/getSizeInMiB'

export async function askForResolution () {
  const res = await prompts({
    name: 'value',
    message: 'Elije las resoluciones para descargar',
    type: 'multiselect',
    hint: 'Todas las opciones se descargan junto al audio',
    instructions: false,
    choices: [
      { title: 'Rendimiento (mínimo)', description: 'Usa la mínima resolución o descarga en 144p y lo deja en 32p', value: { download: '144p', desired: '32p', downloadNumber: 144, desiredNumber: 32 } },
      { title: 'Música (bajo)', description: 'Descarga el video a 144p', value: { download: '144p', desired: '144p', downloadNumber: 144, desiredNumber: 144 } },
      { title: 'Normal (medio)', description: 'Descarga el video a 360p', value: { download: '360p', desired: '360p', downloadNumber: 360, desiredNumber: 360 } },
      { title: 'Leer (alto)', description: 'Descarga el video a 720p', value: { download: '720p', desired: '720p', downloadNumber: 720, desiredNumber: 720 } },
      { title: 'Calidad (máximo)', description: 'Descarga el video a 1080p', value: { download: '1080p', desired: '1080p', downloadNumber: 1080, desiredNumber: 1080 } }
    ],
    min: 1
  })

  // Esto puede traer muchos problemas, ten cuidado al modificar algo relacionado a esto
  return res.value as Resolution[]
}

export async function getMaxResolutionToDownload (_resoluciones: Resolution[]): Promise<Resolution> {
  const resoluciones = [..._resoluciones]
  const maxResolution = { res: '', resNumber: 0, desired: '', desiredNumber: 0 }
  let resolutionNumber = 0
  let desiredNumber = 0

  for (const res of resoluciones) {
    if (!maxResolution.res || !maxResolution.resNumber || maxResolution.resNumber < resolutionNumber) {
      maxResolution.res = res.download
      maxResolution.resNumber = resolutionNumber
      maxResolution.desired = res.desired

      if (res.download.includes('p')) {
        resolutionNumber = Number(res.download.split('p')[0])
      }
      
      if (res.desired.includes('p')) {
        desiredNumber = Number(res.desired.split('p')[0])
      }
    }
  }
  
  return {
    desired: maxResolution.desired,
    download: maxResolution.res,
    desiredNumber: desiredNumber,
    downloadNumber: resolutionNumber
  }
}

export async function getResolutionId (videoId: string, download: string) {
  const ytDlpParams = ['-F', `https://www.youtube.com/watch?v=${videoId}`]
  const ytDlpOutput = await spawnAsync('yt-dlp', ytDlpParams, false)
  const lines: string[] = []

  // console.log('lines', lines)

  for (const line of ytDlpOutput.split('\n')) {
    if (line.includes('storyboard') || line.includes('images') || line.includes('[youtube]') || line.includes('[info]') || line.includes('---') || line.includes('ID') || line.trim() === '') continue
    const cleanedLine = line.replaceAll(/\s+/g, ' ').trim()
    lines.push(cleanedLine)
  }

  const best_id = { id: '', size: '', sizeInMiB: 0, tbr: '', tbrNumber: 0 }

  for (const line of lines) {
    const [part1, part2, part3] = line.split('|').map(p => p.trim())
    if (!part1 || !part2 || !part3) continue
    
    const [id, , res] = part1.split(' ')
    const part2Splitted = part2.split(' ')
    const size = part2Splitted[part2.includes('~') ? 1 : 0]
    const tbr = part2Splitted[part2.includes('~') ? 2 : 1]
    const res_height = res.split('x')[1]

    let videoOnly = false
    if (part3.includes('video only')) videoOnly = true
    
    if (!videoOnly || res_height !== download.replace('p', '')) continue
    
    const sizeInMiB = getSizeInMiB(size)
  
    if ((videoOnly && !best_id.id) || (best_id.sizeInMiB < sizeInMiB) || (best_id.sizeInMiB === sizeInMiB && best_id.tbrNumber < Number(tbr.replace('k', '')))) {
      best_id.id = id
      best_id.size = size
      best_id.sizeInMiB = sizeInMiB
      best_id.tbr = tbr
      best_id.tbrNumber = Number(tbr.replace('k', ''))
    }
  }
  
  return best_id.id
}
