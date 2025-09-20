import prompts from 'prompts'
import { oraPromise } from 'ora'
import { askForResolution, descargarVideo, getMaxResolutionToDownload } from '../../core/pipeline/steps/downloadVideo'
import type { Resolution, Validation } from '../../env'
import type { Video, VideoOptions } from '../../core/types'
import { descargarAudio } from '../../core/pipeline/steps/downloadAudio'
import list from '../../lib/videos-to-suggest.json' with { type: 'json' }
import { demuxVideoAndAudio, muxVideoAndAudio } from '../../core/pipeline/steps/muxing'
import { response, Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { getVideoIdFromUrl } from 'src/utils/readUrl'
import { addNewVideo, getProcessParam, VideoDraft } from 'src/core/process'
import { validateVideoId } from 'src/utils/validations'
import { saveVideoInListOfSuggestions } from 'src/utils/saveVideoInList'
import { createDirectories } from 'src/core/pipeline/steps/createDirectories'

const useDefaultVideo = getProcessParam('useDefaultVideo')

export async function fullProcess () {
  /** = Preguntas =
   * 
   * 1. [x] Modo del programa: Completo
   *      - Completo / Solo descargar / Video+Audio / Personalizado
   * 
   * 2. [x] Opciones para ejecutar el programa
   *      - Descargar video
   *      - Forzar descarga video/audio
   *      - Re-sincronizar audio+video (mux/demux)
   *      - Obtener información
   *      - Descargar thumbnails/assets
   *      - Preguntar si preguntar las resoluciones
   * 
   * 3. [x] Opcional
   *      - Preguntar las resoluciones (si lo marcó antes)
   * 
   * 4. [x] Forma de elegir el video
   *      - Escribir ID
   *      - Escribir la url
   *      - Usar lista de sugeridos
   * 
   * 5. [x] Antes de empezar
   *      - Validar video (si falla volver a la pregunta anterior)
   * 
   * 6. [ ] Comenzar con el video
   *      - Crear directorios
   *      - Ejecutar opciones elegidas antes
   */

  ; // <- Ese punto y coma es para evitar que la descripción de lo de abajo cambie por los comentarios de arriba

  const videoDraft = new VideoDraft()


  // - - - - - - - - - - - - - - - - - - -
  // 2. Opciones para ejecutar el programa

  // Seleccionar opciones para el programa
  const optionsResponse = await prompts({
    message: 'Elije las opciones para ejecutar el programa',
    type: 'multiselect',
    name: 'value',
    instructions: 'Muevete con ↑↓, selecciona con espacio y continua con enter',
    choices: [
      {
        title: 'Descargar video',
        description: 'Si lo desactivas buscará si tienes el video descargado, con audio, o alguna resolución de este, y sino, se cancelará el proceso',
        value: response.downloadVideo,
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
      },
      {
        title: 'Sincronizar video con audio',
        description: 'Unir y separar video con audio',
        value: response.syncVideoAndAudio,
        selected: true
      },
      {
        title: 'Sobreescribir video sincroinzado',
        description: 'Fuerza la mezcla del video con el audio incluso si ya se tiene. Depende de la anterior opción marcada',
        value: response.forceSync,
        selected: false
      },
      {
        title: 'Obtener datos e información del video',
        description: 'Consigue información detallada del video en base a youtube (yt-dlp)',
        value: response.getVideoData,
        selected: true
      },
      {
        title: 'Conseguir carátulas',
        description: 'Consigue diferentes resoluciones de la caratula del video',
        value: response.getThumbnails,
        selected: true
      },
    ]
  })

  // Agregar opciones elegidas a options validando tipos
  for (const opcionElegida of optionsResponse.value as (keyof VideoOptions)[]) {
    const keys = Object.keys(response)
    if (keys.includes(opcionElegida)) {
      videoDraft.options[opcionElegida] = true
    }
  }


  // - - - - - -
  // 3. Opcional

  // 3.1 Preguntar las resoluciones (si lo marcó antes)
  
  let resolutions: Resolution[] | null = null

  // Las resoluciones van en base a lo preguntado, o sino por defecto (360p)
  if (videoDraft.options.askForResolutions) {
    resolutions = await askForResolution()
  } else {
    resolutions = [{ download: '360p', desired: '360p', desiredNumber: 360, downloadNumber: 360 }]
  }
  

  // - - - - - - - - - - - - - -
  // 4. Forma de elegir el video
  
  let video: Video | null = null
  
  const videoChoice = await prompts({
    message: 'Elige una opción',
    type: 'autocomplete',
    name: 'value',
    initial: 'id',
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
      initial: useDefaultVideo ? 'c4mHDmvrn4M' : '',
      validate: (value) => {
        if (!value || !value.trim()) {
          return 'No puedes ingresar un texto vacío'
        }
        return true
      }
    })

    let id = ''
    if (URL.canParse(input)) {
      console.log('valid?', input)
      const idFromUrl = getVideoIdFromUrl(input)
      if (idFromUrl) id = idFromUrl
    } else {
      id = input
    }
    
    video = addNewVideo(id)
  } else {
    video = addNewVideo(videoChoice.value)
  }

  if (!video || !video?.id) return
  

  // - - - - - - - - - -
  // 5. Antes de empezar

  // 5.1 Validar video (si falla volver a la pregunta anterior)
  
  if (!getProcessParam('skipValidation')) {
    let validation: Validation
    try {
      validation = await validateVideoId(video.id)
    } catch (err) {
      errorHandler(err, null, false, true)
      return
    }
    
    if (!validation.success) {
      console.error(validation?.error || 'Error validando el video')
      return
    }

    video.title = validation.partialVideo.title
    
    await saveVideoInListOfSuggestions(video.id, video.title)
  }


  // - - - - - - - - - - - -
  // 6. Comenzar con el video

  // 6.1 Crear directorios

  const createDirectoriesPromise = createDirectories(video.id)
  await oraPromise(createDirectoriesPromise, { text: `Creando directorios para ${video.id}`, successText: `Directorios para ${video.id} creados` })
  
  // 6.2 Ejecutar opciones elegidas antes

  // 6.2.a Descargar video

  if (video.options.downloadVideo) {
    let maxResolutionToDownload: Resolution = { desired: '', download: '', desiredNumber: 0, downloadNumber: 0 }
    try {
      maxResolutionToDownload = await getMaxResolutionToDownload(resolutions)
    } catch {
      errorHandler(null, 'No se pudo descargar el video')
      return
    }

    const downloadVideosPromise = descargarVideo(video.id, resolutions, maxResolutionToDownload, video.options.forceDownloadVideo)
    await oraPromise(downloadVideosPromise, { text: 'Descargando video', successText: 'Video descargado', failText: 'No se pudo descargar el video' })

    const downloadAudioPromise = descargarAudio(video.id, video.options.forceDownloadAudio)
    await oraPromise(downloadAudioPromise, { text: 'Descargando audio', successText: 'Audio descargado', failText: 'No se pudo descargar el audio' })

    // Por ahora lo saco, si veo que da problemas tenerlo en .opus en vez de .mp4 sigo esto
    // const convertAudioPromise = convertirAudio(video.id, options.forceDownloadAudio)
    // await oraPromise(convertAudioPromise, { text: 'Convirtiendo audio', successText: 'Audio convertido', failText: 'No se pudo convertir el audio' })
  }

  if (video.options.syncVideoAndAudio) { 
    const muxVideoAndAudioPromise = muxVideoAndAudio(video.id)
    await oraPromise(muxVideoAndAudioPromise, { text: 'Mezclando audio con video', successText: `Audio y video mezclados en ${Rutas.videos_con_audio}/${video.id}.mp4`, failText: 'No se pudo mezclar el audio con el video' })
    
    const demuxVideoAndAudioPromise = demuxVideoAndAudio(video.id)
    await oraPromise(demuxVideoAndAudioPromise, { text: 'Separando audio y video', successText: `Audio y video separados en ${Rutas.videos}/${video.id}.mp4 y ${Rutas.audios}/${video.id}.opus`, failText: 'No se pudieron separar el audio y el video' })
  }
}
