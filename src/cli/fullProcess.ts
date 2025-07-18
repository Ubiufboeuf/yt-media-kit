import prompts from 'prompts'
import { validateVideoId } from '@/utils/validations'
import { createDirectories } from '@/cli/createDirectories'
import { oraPromise } from 'ora'
import { askForResolution, downloadVideo } from './download'
import { ProgramOptions, Resolution } from '@/env'
import { isDevMode } from '@/lib/arguments'

const response = {
  download: 'download',
  askForResolutions: 'askForResolutions'
}

export async function startFullProcess () {
  // Preguntar por el id del video
  const videoIdRes = await prompts({
    message: 'Video ID',
    type: 'text',
    name: 'videoId',
    initial: 'GZTp2JzcOJ0',
    validate: (value) => {
      if (!value || !value.trim()) {
        return 'No puedes ingresar un texto vacío como id'
      }
      return true
    }
  })

  const { videoId } = videoIdRes
  
  if (!videoId) return

  // Validar resolución
  if (!isDevMode) {
    let validated = false
    try {
      const validation = await validateVideoId(videoId)
      if (validation) {
        validated = true
      }
    } catch (err) {
      console.error(err)
      return
    }
    
    if (!validated) return
  }

  // Crear directorios
  const createDirectoriesPromise = createDirectories(videoId)
  await oraPromise(createDirectoriesPromise, { text: `Creando directorios para ${videoId}`, successText: `Directorios para ${videoId} creados` })

  // Seleccionar opciones para el programa
  const defaultOptions: ProgramOptions = {
    askForResolutions: false,
    download: false
  }

  // const { value: options }: { value: keyof ProgramOptions } = await prompts({
  const optionsResponse = await prompts({
    message: 'Elije las opciones para ejecutar el programa',
    type: 'multiselect',
    name: 'value',
    instructions: 'Muevete con ↑↓, selecciona con espacio y continua con enter',
    choices: [
      {
        title: 'Descargar',
        description: 'Continua con el proceso de descarga',
        value: response.download,
        selected: true
      },
      {
        title: 'Preguntar por resoluciones',
        description: 'Pregunta por las resoluciones al momento de descargar (precisa a Descargar seleccionado)',
        value: response.askForResolutions,
        selected: true
      }
    ]
  })

  const options: ProgramOptions = {...defaultOptions}

  for (const choice of optionsResponse.value as (keyof ProgramOptions)[]) {
    const keys = Object.keys(response)
    if (keys.includes(choice)) {
      options[choice] = true
    }
  }

  if (!options.download) {
    // mixVideoWithAudio(videoId) // <- esto va para después
  }
  
  let resolution: Resolution[] | null = null

  if (options.askForResolutions) {
    resolution = await askForResolution()
  } else {
    // en base a la lista o por defecto 360p
    resolution = [{ download: '360p', desired: '360p' }]
  }

  const downloadPromise = downloadVideo(videoId, resolution)
  await oraPromise(downloadPromise, { text: 'Descargando', successText: 'Descargado' })
}
