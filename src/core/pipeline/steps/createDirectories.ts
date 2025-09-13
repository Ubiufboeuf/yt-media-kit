import { Rutas } from '../../../lib/constants'
import { mkdirp } from 'fs-extra'
import { writeFile } from 'node:fs/promises'

export async function createDirectories (videoId: string) {
  await mkdirp(Rutas.audios_descargados)
  await mkdirp(Rutas.videos_descargados)
  await mkdirp(Rutas.videos_con_audio)
  await mkdirp(Rutas.videos)
  await mkdirp(Rutas.audios)

  await mkdirp(`${Rutas.completos}/${videoId}`)
  await mkdirp(`${Rutas.assets}/${videoId}`)

  await writeFile(`${Rutas.info}/${videoId}.json`, '')
}
