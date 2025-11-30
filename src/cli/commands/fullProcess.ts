import prompts from 'prompts'
import { oraPromise } from 'ora'
import { askForResolution, descargarVideo, getMaxResolutionToDownload } from '../../core/pipeline/steps/downloadVideo'
import type { Resolution, Validation } from '../../env'
import type { VideoOptions } from '../../core/types'
import { descargarAudio } from '../../core/pipeline/steps/downloadAudio'
import list from '../../lib/list-of-videos-to-suggest.json' with { type: 'json' }
import { demuxVideoAndAudio, muxVideoAndAudio } from '../../core/pipeline/steps/sync'
import { response as programOptions } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { getVideoIdFromUrl } from 'src/utils/readUrl'
import  { addNewVideo, getProcessParam } from 'src/core/process'
import { validateVideoId } from 'src/utils/validations'
import { saveVideoInListOfSuggestions } from 'src/utils/saveVideoInList'
import { createDirectories } from 'src/core/pipeline/steps/createDirectories'
import { videoContext } from 'src/core/context'
import { isValidResolution, VideoDraft, type Video } from 'src/core/video'
import { MAX_RESOLUTION_TO_DOWNLOAD } from 'src/core/constants'
import { createResolutions } from 'src/core/pipeline/steps/createResolutions'
import { createStreams } from 'src/core/pipeline/steps/createStreams'

const useDefaultVideoId = getProcessParam('useDefaultVideoId')

export async function fullProcess () {
  // Cargar contexto
  let context
  try {  
    context = videoContext.getStore()
    if (!context?.id) {
      throw new Error('Falta el id del contexto')
    }
  } catch (err) {
    errorHandler(err)
    return
  }

  const videoDraft = new VideoDraft(context.id)

  // Opciones para ejecutar el programa
  const programOptionsResponse = await prompts({
    message: 'Elige las opciones para ejecutar el programa',
    type: 'multiselect',
    name: 'value',
    instructions: 'Muevete con ↑↓, selecciona con espacio y continua con enter ',
    min: 1,
    choices: [
      {
        title: 'Descargar video',
        description: 'Si lo desactivas buscará si tienes el video descargado, con audio, o alguna resolución de este, y sino, se cancelará el proceso',
        value: programOptions.downloadVideo,
        selected: false
      },
      {
        title: 'Preguntar resoluciones',
        description: 'Pregunta por las resoluciones que quieras tener, y sino elige 360p',
        value: programOptions.askForResolutions,
        selected: false
      },
      {
        title: 'Sincronizar video con audio',
        description: 'Unir video con audio antes de crear las resoluciones',
        value: programOptions.syncVideoAndAudio,
        selected: false
      },
      {
        title: 'Separar video y audio',
        description: 'Separa el video y el audio antes de crear las resoluciones',
        value: programOptions.unsyncVideoAndAudio,
        selected: false
      },
      {
        title: 'Crear stream del video en formato DASH',
        description: 'Crea un stream del video, separándolo en fragmentos y creando un manifest de ellos. Ideal para un reproductor de video via streaming como YouTube o Twitch',
        value: programOptions.createDashStream,
        selected: false
      },
      {
        title: 'Obtener datos e información del video',
        description: 'Consigue información detallada del video en base a yt-dlp',
        value: programOptions.getVideoData,
        selected: false
      },
      {
        title: 'Conseguir carátulas',
        description: 'Consigue diferentes resoluciones de la caratula del video',
        value: programOptions.getThumbnails,
        selected: false
      }
    ]
  })

  // Opciones para forzar del programa
  const programForceResponse = await prompts({
    message: 'Elige las opciones para forzar del programa',
    type: 'multiselect',
    name: 'value',
    instructions: 'Muevete con ↑↓, selecciona con espacio y continua con enter ',
    choices: [
      {
        title: 'Sobreescribir descarga de video',
        description: 'Fuerza una descarga del video, incluso si ya existe',
        value: programOptions.forceDownloadVideo,
        selected: false
      },
      {
        title: 'Sobreescribir descarga de audio',
        description: 'Fuerza una descarga del audio, incluso si ya existe',
        value: programOptions.forceDownloadAudio,
        selected: false
      },
      {
        title: 'Sobreescribir video sincronizado',
        description: 'Fuerza la mezcla del video con el audio, incluso si ya existe. Depende de la opción anterior marcada',
        value: programOptions.forceSync,
        selected: false
      },
      {
        title: 'Sobreescribir video y audio separados',
        description: 'Fuerza la separación del video y del audio, incluso si ya existen. Depende de la opción anterior marcada',
        value: programOptions.forceUnsync,
        selected: false
      }
    ]
  })

  // Agregar opciones elegidas a options, validando tipos
  for (const opcionElegida of [...(programOptionsResponse.value || []), ...(programForceResponse.value || [])] as (keyof VideoOptions)[]) {
    const keys = Object.keys(programOptions)
    if (keys.includes(opcionElegida)) {
      videoDraft.options[opcionElegida] = true
    }
  }

  // Forma de elegir el video (id, url, lista)
  let video: Video | null = null
  
  const videoChoice = await prompts({
    message: 'Elige una opción',
    type: 'autocomplete',
    name: 'value',
    initial: 'custom',
    choices: [
      { title: 'Escribir el ID o URL', value: 'custom', description: 'Si es la URL de una lista se conseguirá el ID del video que se esté reproduciendo' },
      // Pongo title e id al revés para que puedas buscar por id, más facil por ciertos carácteres de los títulos
      ...list.map(({ id, title }) => ({ title: id, value: id, description: title }))
    ]
  })

  if (videoChoice.value === 'custom') {
    const { value: input } = await prompts({
      message: 'ID o URL del video',
      type: 'text',
      name: 'value',
      initial: useDefaultVideoId ? 'c4mHDmvrn4M' : '',
      validate: (value) => {
        if (!value || !value.trim()) {
          return 'No puedes ingresar un texto vacío'
        }
        return true
      }
    })

    let ytId = ''
    if (URL.canParse(input)) {
      const idFromUrl = getVideoIdFromUrl(input)
      if (idFromUrl) ytId = idFromUrl
    } else {
      ytId = input
    }
    
    video = addNewVideo(ytId, videoDraft)
  } else {
    video = addNewVideo(videoChoice.value, videoDraft)
  }

  if (!video || !video?.id) return

  // Preguntar las resoluciones si lo marcó antes (por defecto 360p)
  let resolutions: Resolution[] | null = null
  if (video.options.downloadVideo && video.options.askForResolutions) {
    resolutions = await askForResolution()
  }

  if (resolutions?.length && resolutions.every((r) => isValidResolution(r))) { 
    video.resolutions = resolutions
  }
  
  // Validar video
  if (!getProcessParam('skipValidation')) {
    let validation: Validation
    try {
      validation = await validateVideoId(video.ytId, video.options.downloadVideo, video.options.downloadAudio)
    } catch (err) {
      errorHandler(err, null, false, true)
      return
    }
    
    if (!validation.success) {
      console.error(validation?.error || 'Error validando el video')
      return
    }

    video.title = validation.title
    
    await saveVideoInListOfSuggestions(video.ytId, video.title)
  }

  const createDirectoriesPromise = createDirectories(video.ytId)
  await oraPromise(createDirectoriesPromise, { text: `Creando directorios para ${video.ytId}`, successText: `Directorios para ${video.ytId} creados` })
  
  video.options.downloadAudio = true
  // Descargar video
  if (video.options.downloadVideo) {
    let maxResolutionToDownload: Resolution = MAX_RESOLUTION_TO_DOWNLOAD
    try {
      maxResolutionToDownload = await getMaxResolutionToDownload(video.resolutions)
    } catch {
      errorHandler(null, 'No se pudo descargar el video')
      return
    }

    video.maxResolutionToDownload = maxResolutionToDownload

    const downloadVideosPromise = descargarVideo(video)
    await oraPromise(downloadVideosPromise, { text: 'Descargando video', successText: 'Video descargado', failText: 'No se pudo descargar el video' })

    const downloadAudioPromise = descargarAudio(video)
    await oraPromise(downloadAudioPromise, { text: 'Descargando audio', successText: 'Audio descargado', failText: 'No se pudo descargar el audio' })
  }

  // Unir video con audio (mux)
  if (video.options.syncVideoAndAudio) { 
    const muxVideoAndAudioPromise = muxVideoAndAudio(video.ytId, video)
    await oraPromise(muxVideoAndAudioPromise, { text: 'Mezclando audio con video', successText: 'Audio y video mezclados correctamente', failText: 'No se pudo mezclar el audio con el video' })
  }

  // Separar video y audio (demux)
  if (video.options.unsyncVideoAndAudio) {
    const demuxVideoAndAudioPromise = demuxVideoAndAudio(video.ytId, video)
    await oraPromise(demuxVideoAndAudioPromise, { text: 'Separando audio y video', successText: 'Audio y video separados correctamente', failText: 'No se pudieron separar el audio y el video' })
  }

  // Crear resoluciones
  if (video) {
    const createResolutionsPromise = createResolutions(video.ytId, video)
    await oraPromise(createResolutionsPromise, { text: 'Creando resoluciones', successText: 'Resoluciones creadas correctamente', failText: 'No se pudieron crear las resoluciones' })
  }

  // Crear stream DASH
  if (video.options.createDashStream) {
    const createResolutionsPromise = createStreams(video.ytId, video)
    await oraPromise(createResolutionsPromise, { text: 'Creando streams', successText: 'Streams del video creados', failText: 'No se pudieron crear los streams del video' })
  }

  // Obtener información
  if (video.options.getVideoData) {
    // ...
  }

  // Descargar thumbnails/assets
  if (video.options.getThumbnails) {
    // ...
  }
}
