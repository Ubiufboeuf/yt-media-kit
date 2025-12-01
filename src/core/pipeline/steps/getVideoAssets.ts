import { mkdir, stat, writeFile } from 'node:fs/promises'
import { videoContext } from 'src/core/context'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { spawnAsync } from 'src/utils/spawnAsync'

interface AssetData {
  id: string // Altura de la miniatura (ej. '720')
  url: string
  width: number
  height: number
  path: string // Ruta local completa
}

// ----------------------------------------------------
// FUNCIÓN PRINCIPAL
// ----------------------------------------------------

export async function getVideoAssets (ytId: string) {
  const context = videoContext.getStore()
  const yt_dlp_data = context?.yt_dlp_data

  if (!context || !yt_dlp_data) {
    errorHandler(null, 'Faltan datos de contexto o yt-dlp para los assets')
    return []
  }
  
  const assetsFolder = `${Rutas.assets}/${ytId}`
  const allThumbnails: AssetData[] = []
  
  // 1. Recolección de Miniaturas del Video
  if (yt_dlp_data.thumbnails) {
    for (const t of yt_dlp_data.thumbnails) {
      // Ignorar si faltan datos críticos o si la URL no parece válida
      if (!t.url || !t.width || !t.height) continue
      
      try {
        const id = `${t.height}` // ID basado en la altura (ej. "720")
        const thumbnail = await saveImage({ ...t, url: t.url, width: t.width, height: t.height, id }, assetsFolder)
        if (thumbnail) allThumbnails.push(thumbnail)
      } catch (err) {
        errorHandler(err, `Error al guardar miniatura ${t.height}p`)
      }
    }
  }

  // 2. Crear Miniatura Mínima (Minimal Thumbnail)
  // Se crea a partir de la miniatura de más alta resolución descargada.
  await createMinimalThumbnail(ytId, assetsFolder, allThumbnails)

  return allThumbnails
}

// ----------------------------------------------------
// FUNCIONES DE SOPORTE
// ----------------------------------------------------

async function saveImage (img: { url: string, width: number, height: number, id: string }, path: string): Promise<AssetData | null> {
  try {
    new URL(img.url) // Comprueba si la URL es válida
  } catch {
    errorHandler(null, `URL inválida para asset: ${img.id}`)
    return null
  }

  try {
    const data = await fetch(img.url)
    const buffer = await data.arrayBuffer()
    const type = data.headers.get('content-type')
    const format = type?.split('/')[1] ?? 'jpeg'

    const filename = `${img.id}.${format}`
    const fullPath = `${path}/${filename}`
    
    // Crear el directorio si no existe
    await stat(path).catch(async () => {
      await mkdir(path, { recursive: true })
    })

    await writeFile(fullPath, Buffer.from(buffer))

    return { ...img, path: fullPath }

  } catch (err) {
    errorHandler(err, `Error al guardar la imagen ${img.id} desde ${img.url}`)
    return null
  }
}

async function createMinimalThumbnail (ytId: string, path: string, allThumbnails: AssetData[]) {
  // 1. Encontrar la miniatura de más alta resolución
  const highResThumbnail = allThumbnails.reduce((max, current) => {
    // Usamos Number(current.id) ya que el ID es la altura como string
    const currentHeight = Number(current.id) 
    if (currentHeight > max.height) {
      return { id: current.id, height: currentHeight, path: current.path }
    }
    return max
  }, { id: '0', height: 0, path: '' }) 

  if (!highResThumbnail || highResThumbnail.height === 0) {
    errorHandler(null, 'No se encontró una miniatura de alta resolución para crear la mínima.')
    return
  }
  
  const inputFile = highResThumbnail.path
  const outputFile = `${path}/minimal.webp`
  
  // 2. Ejecutar FFmpeg para escalar
  const params = [
    '-i', inputFile, 
    '-vf', 'scale=64:-1', // Escalar a 64px de ancho, manteniendo el aspecto
    outputFile
  ]
  
  try {
    await spawnAsync('ffmpeg', params)
  } catch (err) {
    errorHandler(err, 'Error creando la miniatura mínima con FFmpeg')
  }
}
