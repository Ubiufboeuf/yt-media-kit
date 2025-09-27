import { oraPromise } from 'ora'
import list from '../../lib/list-of-videos-to-suggest.json' with { type: 'json' }
import prompts from 'prompts'
import { DEFAULT_RESOLUTIONS, MAX_RESOLUTION_TO_DOWNLOAD } from 'src/core/constants'
import { videoContext } from 'src/core/context'
import { createDirectories } from 'src/core/pipeline/steps/createDirectories'
import { askForResolution, descargarVideo, getMaxResolutionToDownload } from 'src/core/pipeline/steps/downloadVideo'
import { addNewVideo, getProcessParam, loadProcessPreferences } from 'src/core/process'
import { type Video, VideoDraft } from 'src/core/video'
import type { Resolution, Validation } from 'src/env'
import { response } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { getVideoIdFromUrl } from 'src/utils/readUrl'
import { saveVideoInListOfSuggestions } from 'src/utils/saveVideoInList'
import { isValidKeyOfVideoOption, validateVideoId } from 'src/utils/validations'
import { descargarAudio } from 'src/core/pipeline/steps/downloadAudio'

const preferences = loadProcessPreferences()
const useDefaultVideoId = getProcessParam('useDefaultVideoId')
const skipValidation = getProcessParam('skipValidation')

export async function download () {
  /**
   * [x] Preguntar si descargar audio y video (checklist)
   * [x] Agregar opciones al videoDraft
   * [x] Preguntar resolución del video (si lo marcó)
   * [x] Preguntar forma de elegir el video (id, url, lista)
   * [x] Validar
   * [x] Crear directorios
   * [x] Descargar
   */

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


  // - - - - - - - - - - - - - - - - - - - - - - - -
  // Preguntar si descargar audio y video (checklist)

  const options = await prompts({
    message: 'Elige las opciones para ejecutar la descarga',
    type: 'multiselect',
    name: 'value',
    instructions: 'Muevete con ↑↓, selecciona con espacio y continua con Enter. ',
    min: 1,
    choices: [
      {
        title: 'Descargar audio',
        value: response.downloadAudio,
        selected: true
      },
      {
        title: 'Descargar video',
        value: response.downloadVideo,
        selected: true
      },
      {
        title: 'Forzar descarga de audio',
        value: response.forceDownloadAudio,
        selected: false
      },
      {
        title: 'Forzar descarga de video',
        value: response.forceDownloadVideo,
        selected: false
      },
      {
        title: 'Preguntar resoluciones para descargar',
        description: 'Si desmarcas esta opción se descargará en 360p. Incluso marcada, si no marcas "Descargar video" esta no hará nada',
        value: response.askForResolutions,
        selected: true
      }
    ]
  })


  // - - - - - - - - - - - - - - -
  // Agregar opciones al videoDraft

  for (const opcion of options.value) {
    if (!isValidKeyOfVideoOption(opcion)) continue

    const keys = Object.keys(response)
    if (keys.includes(opcion)) {
      videoDraft.options[opcion] = true
    }
  }

  
  // - - - - - - - - - - - - - - - - - - - - - -
  // Preguntar resolución del video (si lo marcó)

  let resoluciones: Resolution[] = DEFAULT_RESOLUTIONS

  if (videoDraft.options.downloadVideo && videoDraft.options.askForResolutions) {
    resoluciones = await askForResolution()
  }

  videoDraft.resolutions = resoluciones
  
  
  // - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Preguntar forma de elegir el video (id, url, lista)
  
  let video: Video | undefined

  const videoOption = await prompts({
    message: 'Elige una opción',
    type: 'autocomplete',
    name: 'value',
    initial: 'custom',
    choices: [
      { title: 'Escribir el ID o URL', value: 'custom', description: 'Si es la URL de una lista se conseguirá el ID del video que se esté reproduciendo' },
      ...list.map(({ id, title }) => ({ title: id, value: id, description: title }))
    ]
  })

  if (videoOption.value === 'custom') {
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

    let ytId = input

    if (URL.canParse(input)) {
      const idFromUrl = getVideoIdFromUrl(input)
      if (idFromUrl) ytId = idFromUrl
    }
    
    video = addNewVideo(ytId, videoDraft)
  } else {
    video = addNewVideo(videoOption.value, videoDraft)
  }

  if (!video || !video?.id) return


  // - - - -
  // Validar

  if (!skipValidation) {
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


  // - - - - - - - - -
  // Crear directorios

  const createDirectoriesPromise = createDirectories(video.ytId)
  await oraPromise(createDirectoriesPromise, { text: `Creando directorios para ${video.ytId}`, successText: `Directorios para ${video.ytId} creados` })
    
  
  // - - - - -
  // Descargar

  if (video.options.downloadVideo) {
    let maxResolutionToDownload: Resolution = MAX_RESOLUTION_TO_DOWNLOAD
    try {
      maxResolutionToDownload = await getMaxResolutionToDownload(video.resolutions)
    } catch {
      errorHandler(null, 'No se pudo conseguir la resolución más alta para descargar del video')
      return
    }

    video.maxResolutionToDownload = maxResolutionToDownload

    const downloadVideosPromise = descargarVideo(video)
    await oraPromise(downloadVideosPromise, { text: 'Descargando video', successText: 'Video descargado', failText: 'No se pudo descargar el video' })

  }

  if (video.options.downloadAudio) {
    const downloadAudioPromise = descargarAudio(video)
    await oraPromise(downloadAudioPromise, { text: 'Descargando audio', successText: 'Audio descargado', failText: 'No se pudo descargar el audio' })
  }
}
