import { spawnAsync } from '../../../utils/spawnAsync'
import type { Resolution } from '../../../env'
import prompts from 'prompts'
import { getSizeInMiB } from '../../../utils/getSizeInMiB'
import { readdir } from 'fs/promises'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { download } from 'src/utils/download'
import { unlinkSync } from 'node:fs'
import chalk from 'chalk'

export async function askForResolution () {
  const res = await prompts({
    name: 'value',
    message: 'Elige las resoluciones del video',
    type: 'multiselect',
    instructions: 'Muevete con ↑↓ y elige con enter',
    choices: [
      { title: 'Rendimiento (mínimo)', description: 'Usa la mínima resolución o descarga en 144p y lo deja en 32p', value: { download: '144p', desired: '32p', downloadNumber: 144, desiredNumber: 32 } },
      { title: 'Música (bajo)', description: 'Descarga el video en 144p', value: { download: '144p', desired: '144p', downloadNumber: 144, desiredNumber: 144 } },
      { title: 'Normal (medio)', description: 'Descarga el video en 360p', value: { download: '360p', desired: '360p', downloadNumber: 360, desiredNumber: 360 } },
      { title: 'Leer (alto)', description: 'Descarga el video en 720p', value: { download: '720p', desired: '720p', downloadNumber: 720, desiredNumber: 720 } },
      { title: 'Calidad (máximo)', description: 'Descarga el video en 1080p', value: { download: '1080p', desired: '1080p', downloadNumber: 1080, desiredNumber: 1080 } }
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
    const [part1, part2, part3] = line.split('|').map((p) => p.trim())
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

export async function descargarVideo (videoId: string, maxResToDownload: Resolution, forceDownload: boolean = false) {
  // console.log('descargar video', videoId, resolutions, maxResToDownload, forceDownload)
  let videosDescargados: string[] = []
  try {
    videosDescargados = await readdir(Rutas.videos_descargados, 'utf8')
  } catch (err) {
    errorHandler(err, 'Error leyendo los videos descargados')
  }

  if (!videosDescargados.some((file) => file.includes(videoId))) {
    // Si no hay videos descargados con este id, descarga la máxima resolución que quiere el usuario
    await download('video', videoId, forceDownload, maxResToDownload)
    return
  }

  let videoDescargado = ''
  for (const video of videosDescargados) {
    if (video.includes(videoId)) {
      videoDescargado = video
    }
  }

  const match = videoDescargado.match(/\[(.+)\]/)
  const resolucion = match?.[1]
  
  if (resolucion === maxResToDownload.download) {
    if (forceDownload) {
      // Si el usuario tiene descargada la misma resolución que quiere, pero fuerza, descarga
      unlinkSync(`${Rutas.videos_descargados}/${videoDescargado}`)
      await download('video', videoId, true, maxResToDownload)
      return
    }

    console.log(chalk.gray('\n(Ya existe el video, omitiendo)'))
    return
  }

  // Si es mayor o menor, pero diferente a la que tiene el usuario, descarga
  await download('video', videoId, forceDownload, maxResToDownload)
  unlinkSync(`${Rutas.videos_descargados}/${videoDescargado}`)
}
