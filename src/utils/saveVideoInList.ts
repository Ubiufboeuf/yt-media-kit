import type { List } from '../env'
import { KWD, Rutas } from '../lib/constants'
import { readFile, writeFile } from 'node:fs/promises'
import { oraPromise } from 'ora'

export async function saveVideoInListOfSuggestions (videoId: string, title: string) {
  let listStr: string
  try {
    listStr = await readFile(Rutas.suggest_list, 'utf8')
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error('Error leyendo list.json')
    }
  }

  let list: List
  try {
    list = JSON.parse(listStr)
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error('Error parseando list.json')
    }
  }

  if (list.some(video => video.id === videoId)) return
  
  const newList: List = [
    ...list,
    { id: videoId, title: title.replaceAll('\n', '') }
  ]

  console.log('newList', newList)

  try {
    await oraPromise(writeFile(`${KWD}/src/lib/list.json`, JSON.stringify(newList, null, 2)), { text: 'Guardando...', successText: 'Texto guardado' })
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error('Error guardando el video en list.json')
    }
  }
}
