import type { Resolution } from '../env'
import prompts from 'prompts'

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
