import { CWD } from '@/lib/constants'
import { mkdirp } from 'fs-extra'

export async function createDirectories (videoId: string) {
  mkdirp(`${CWD}/recursos/assets/${videoId}`)
  mkdirp(`${CWD}/recursos/info/${videoId}`)
  mkdirp(`${CWD}/recursos/por_procesar/1_audios`) // <- acá no va directorio, va archivo
  mkdirp(`${CWD}/recursos/por_procesar/1_videos_sin_audio`) // <- acá no va directorio, va archivo
  mkdirp(`${CWD}/recursos/procesados/2_videos`) // <- acá no va directorio, va archivo
  mkdirp(`${CWD}/recursos/procesados/3_audios`) // <- acá no va directorio, va archivo
  mkdirp(`${CWD}/recursos/procesados/3_videos_sin_audio`) // <- acá no va directorio, va archivo
  mkdirp(`${CWD}/recursos/completos/${videoId}`)
}
