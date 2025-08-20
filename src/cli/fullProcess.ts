import prompts, { type Choice } from 'prompts'
import { validateVideoId } from '../utils/validations'
import { createDirectories } from '../cli/createDirectories'
import { oraPromise } from 'ora'
import { askForResolution, descargarVideo, getMaxResolutionToDownload } from '../cli/downloadVideo'
import type { ProgramOptions, Resolution } from '../env'
import { isDevMode } from '../lib/cli_arguments'
import { descargarAudio } from './downloadAudio'
import list from '../../config/list.json' with { type: 'json' }
import { saveVideoInList } from '../utils/saveVideoInList'
// import { convertirAudio } from './convertirAudio'

const response = {
  downloadVideos: 'downloadVideos',
  askForResolutions: 'askForResolutions',
  forceDownloadVideo: 'forceDownloadVideo',
  forceDownloadAudio: 'forceDownloadAudio'
}

export async function startFullProcess () {
  const choices: Choice[] = [
    { title: 'Escribir el ID', value: 'custom' },
    // Pongo title e id al revés para que puedas buscar por id, más facil por ciertos carácteres
    ...list.map(({ id, title }) => ({ title: id, value: id, description: title }))
  ]

  // Preguntar por el id del video
  const opcion = await prompts({
    message: 'Elige una opción',
    type: 'autocomplete',
    name: 'value',
    initial: 'custom',
    choices
  })

  // console.log(videoIdRes)

  let videoId = opcion.value

  if (opcion.value === 'custom') {
    const opcion = await prompts({
      message: 'ID del video',
      type: 'text',
      name: 'value',
      initial: isDevMode ? 'c4mHDmvrn4M' : '',
      choices,
      validate: (value) => {
        if (!value || !value.trim()) {
          return 'No puedes ingresar un texto vacío como id'
        }
        return true
      }
    })
    
    videoId = opcion.value
  }

  if (!videoId) return

  // Validar resolución
  if (!isDevMode) {
    let validated = false
    try {
      const title = await validateVideoId(videoId)
      console.log('Video:', title)
      if (title) {
        await saveVideoInList(videoId, title)
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
    downloadVideos: false,
    forceDownloadVideo: false,
    forceDownloadAudio: false
  }

  // const { value: options }: { value: keyof ProgramOptions } = await prompts({
  const optionsResponse = await prompts({
    message: 'Elije las opciones para ejecutar el programa',
    type: 'multiselect',
    name: 'value',
    instructions: 'Muevete con ↑↓, selecciona con espacio y continua con enter',
    choices: [
      {
        title: 'Descargar video',
        description: 'Si lo desactivas descarga 144p y guarda 32p al final. (Es necesario al menos una pista de audio y video)',
        value: response.downloadVideos,
        selected: true
      },
      {
        title: 'Preguntar por resoluciones',
        description: 'Pregunta por las resoluciones al momento de descargar los videos, y sino descarga 360p',
        value: response.askForResolutions,
        selected: true
      },
      {
        title: 'Sobreescribir descarga de video',
        description: 'Fuerza una descarga de la/s resoluciones, incluso si ya existen',
        value: response.forceDownloadVideo,
        selected: false
      },
      {
        title: 'Sobreescribir descarga de audio',
        description: 'Fuerza una descarga del audio, incluso si ya existe',
        value: response.forceDownloadAudio,
        selected: false
      }
    ]
  })

  const options: ProgramOptions = {...defaultOptions}

  // Agregar opciones elegidas a options validando tipos
  for (const opcionElegida of optionsResponse.value as (keyof ProgramOptions)[]) {
    const keys = Object.keys(response)
    if (keys.includes(opcionElegida)) {
      options[opcionElegida] = true
    }
  }

  if (!options.downloadVideos) {
    // mixVideoWithAudio(videoId) // <- esto va para después
    console.log('no download video')
    return
  }
  
  let resolutions: Resolution[] | null = null

  if (options.askForResolutions) {
    resolutions = await askForResolution()
  } else {
    // en base a la lista o por defecto 360p
    resolutions = [{ download: '360p', desired: '360p', desiredNumber: 360, downloadNumber: 360 }]
  }

  // Es la máxima resolución, no el id para descargar, eso lo maneja descargarVideo()
  let maxResolutionToDownload: Resolution = { desired: '', download: '', desiredNumber: 0, downloadNumber: 0 }
  try {
    maxResolutionToDownload = await getMaxResolutionToDownload(resolutions)
  } catch {
    console.error('No se pudo descargar el video')
    return
  }

  const downloadVideosPromise = descargarVideo(videoId, resolutions, maxResolutionToDownload, options.forceDownloadVideo)
  await oraPromise(downloadVideosPromise, { text: 'Descargando video', successText: 'Video descargado', failText: 'No se pudo descargar el video' })

  const downloadAudioPromise = descargarAudio(videoId, options.forceDownloadAudio)
  await oraPromise(downloadAudioPromise, { text: 'Descargando audio', successText: 'Audio descargado', failText: 'No se pudo descargar el audio' })

  // Por ahora lo saco, si veo que da problemas tenerlo en .opus en vez de .mp4 termino esto
  // const convertAudioPromise = convertirAudio(videoId, options.forceDownloadAudio)
  // await oraPromise(convertAudioPromise, { text: 'Convirtiendo audio', successText: 'Audio convertido', failText: 'No se pudo convertir el audio' })

  // mixVideoWithAudio(videoId)
}
