import type { List } from '../env'
import { Rutas } from '../lib/constants'
import { readFile, writeFile } from 'node:fs/promises'
import { oraPromise } from 'ora'
import { errorHandler } from './errorHandler'

export async function saveVideoInListOfSuggestions (videoId: string, title: string) {
  let listStr: string
  try {
    listStr = await readFile(Rutas.suggest_list, 'utf8')
  } catch (err) {
    throw errorHandler(err, 'Error leyendo la lista de sugerencias')
  }

  let list: List
  try {
    list = JSON.parse(listStr)
  } catch (err) {
    throw errorHandler(err, 'Error parseando la lista de sugerencias')
  }

  if (list.some(video => video.id === videoId)) return
  
  const newList: List = [
    ...list,
    { id: videoId, title: title.replaceAll('\n', '') }
  ]

  try {
    await oraPromise(writeFile(`${Rutas.suggest_list}`, JSON.stringify(newList, null, 2)), { text: 'Guardando...', successText: 'Texto guardado' })
  } catch (err) {
    errorHandler(err, 'Error guardando el video en la lista de sugerencias')
  }
}
