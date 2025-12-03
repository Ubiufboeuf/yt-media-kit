import { readFile } from 'node:fs/promises'
import { videoContext } from 'src/core/context'
import type { Thumbnail } from 'src/core/types'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'

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

  if (!videoData.__provisional) {
    throw new Error('No hay datos suficientes para conseguir las carátulas del video')
  }

  const data_thumbnails = videoData.__provisional.thumbnails
  const thumbnails: Thumbnail[] = []

  for (const thumbnail of data_thumbnails) {

  }

  return
}
