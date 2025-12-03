import { readdir, readFile, writeFile } from 'node:fs/promises'
import { videoContext } from 'src/core/context'
import type { Thumbnail } from 'src/core/types'
import type { Thumbnail as DataThumbnail } from 'src/core/yt-dlp.types'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { spawn } from 'child_process'
import type { ImageData } from 'src/core/ffmpeg.types'
import chalk from 'chalk'

export async function getVideoAssets (ytId: string) {
  // Cargar contexto
  const context = videoContext.getStore()
  if (!context) {
    throw new Error('Falta el contexto del video')
  }

  if (!context.videoData) {
    let savedData
    try {
      savedData = await readFile(`${Rutas.info}/${ytId}.json`, 'utf8')
    } catch (err) {
      errorHandler(err, 'Error leyendo el archivo de datos del video')
      return
    }

    if (savedData === '{}') {
      // Tiro errores porque sino aparece que el proceso fue exitoso, cuando no
      throw new Error('Los datos guardados son un objeto vacío')
    }

    let savedJson
    try {
      savedJson = await JSON.parse(savedData)
    } catch (err) {
      errorHandler(err, 'Error leyendo el archivo de datos del video')
      return
    }

    if (!savedJson) {
      throw new Error('No se pudo usar la información guardada del video')
    }

    context.videoData = savedJson
  }

  const videoData = context.videoData
  if (!videoData) {
    // El código no debería llegar hasta acá
    throw new Error('El código no debería llegar hasta acá. La variable videoData es falsy')
  }

  if (!videoData.__provisional && videoData.thumbnails) {
    console.log(chalk.gray('\nSe omitirá la descarga de carátulas porque se encontraron datos en el archivo de información'))
    return
  } else if (!videoData.__provisional) {
    throw new Error('No hay datos suficientes para conseguir las carátulas del video')
  }

  const data_thumbnails = videoData.__provisional.thumbnails

  let savedThumbnails: string[] = []
  try {
    savedThumbnails = await readdir(`${Rutas.assets}/${ytId}`)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de assets del video. No se omitirá ninguna descarga')
  }
  
  const thumbnails: Thumbnail[] = []

  for (const data_thumbnail of data_thumbnails) {
    if (savedThumbnails.some((file) => file.includes(ytId) && file.includes(`${data_thumbnail.height}`))) continue
    
    let thumbnailRawData: Thumbnail | undefined
    try {
      thumbnailRawData = await getThumbnail(ytId, data_thumbnail)
    } catch (err) {
      errorHandler(err, `Error guardando la carátula (${data_thumbnail.id})`)
      continue
    }

    if (!thumbnailRawData) continue

    if (thumbnails.some((t) => t.id === thumbnailRawData.id)) continue
    
    thumbnails.push(thumbnailRawData)
  }

  thumbnails.sort((a, b) => {
    if (a.height > b.height) return 1
    if (a.height < b.height) return -1
    return 0
  })

  videoData.thumbnails = thumbnails
  delete videoData.__provisional

  let maxHeight
  let minHeight = maxHeight = thumbnails[0].height

  for (const { height } of thumbnails) {
    minHeight = height < minHeight ? height : minHeight
    maxHeight = height > maxHeight ? height : maxHeight
  }

  videoData.min_thumbnail = thumbnails.find((t) => t.height === minHeight)?.id
  videoData.max_thumbnail = thumbnails.find((t) => t.height === maxHeight)?.id

  try {
    await writeFile(`${Rutas.info}/${ytId}.json`, JSON.stringify(videoData, (_, value) => value === undefined ? null : value, 2))
  } catch (err) {
    errorHandler(err, 'Error guardando los datos del video')
  }
}

async function getThumbnail (ytId: string, thumbnail: DataThumbnail): Promise<Thumbnail | undefined> {
  let res
  try {  
    res = await fetch(thumbnail.url)
  } catch {
    throw new Error('Error haciendo la petición de la imagen')
  }

  let arrayBuffer
  try {
    arrayBuffer = await res.arrayBuffer()
  } catch {
    throw new Error('Error consiguiendo el array buffer de la imagen')
  }

  if (!arrayBuffer) return

  const buffer = Buffer.from(arrayBuffer)
  let imageData
  try {
    imageData = await probeBlob(buffer)
  } catch (err) {
    errorHandler(err, 'Error comprobando los datos de la imagen')
  }

  if (!imageData) return
  
  const stream = imageData.streams[0]
  const file = `${stream.height}.png`
  
  try {
    writeFile(`${Rutas.assets}/${ytId}/${file}`, buffer)
  } catch {
    throw new Error('Error guardando la imagen')
  }

  return {
    height: stream.height,
    width: stream.width,
    id: `${stream.height}p`,
    url: null
  }
}

async function probeBlob (buffer: Buffer): Promise<ImageData> {
  return new Promise((resolve) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      '-'
    ])

    let output = ''
    ffprobe.stdout.on('data', (d) => output += d)
    ffprobe.stderr.on('data', (err) => console.error(String(err)))

    ffprobe.on('close', () => resolve(JSON.parse(output)))

    // Mandamos la imagen cruda al stdin del proceso
    ffprobe.stdin.write(buffer)
    ffprobe.stdin.end()
  })
}
