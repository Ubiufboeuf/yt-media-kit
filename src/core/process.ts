import type { Process, ProcessPreferences } from 'src/core/types'
import type { ProcessParams } from 'src/core/types'
import { Arguments, DEFAULT_PROCESS_PREFERENCES, listOfParamsToCancelInteractiveMode } from 'src/core/constants'
import { argv } from 'node:process'
import { devParams } from './constants'
import { Video, type VideoDraft } from './video'

const process: Process = {
  videos: [],
  params: {
    version: false,
    help: false,
    interactiveMode: true,
    isDevMode: false,
    skipValidation: false,
    useDefaultVideoId: false
  },
  preferences: DEFAULT_PROCESS_PREFERENCES
}

// === === === === === === === ===
// ===  Funciones del proceso  ===
// === === === === === === === ===

export function setProcessMode (mode: string) {
  process.mode = mode
}

export function isValidProcessParamKey (key: string): key is keyof typeof process.params {
  return key in process.params
}

export function getProcessParam (param: keyof ProcessParams) {
  if (Object.keys(process.params).includes(param)) {
    return process.params[param]
  }
}

export function setProcessParam (param: keyof ProcessParams, value: boolean) {
  if (Object.keys(process.params).includes(param)) {
    process.params[param] = value
  }
}

export function loadProcessParams (): ProcessParams {    
  const args = argv.join(' ')
  
  const help = args.includes(Arguments.help.toLowerCase())
  const version = args.includes(Arguments.version.toLowerCase())
  const skipValidation = args.includes(Arguments.skipValidation.toLowerCase())
  const useDefaultVideoId = args.includes(Arguments.useDefaultVideoId.toLowerCase())
  const isDevMode = args.includes(Arguments.dev.toLowerCase())

  const processParams = {
    ...process.params,
    skipValidation,
    useDefaultVideoId,
    isDevMode,
    ...(isDevMode ? devParams : {}),
    version,
    help
  }

  for (const [param, value] of Object.entries(processParams)) {
    if (isValidProcessParamKey(param)) {
      setProcessParam(param, value)
      
      if (listOfParamsToCancelInteractiveMode.includes(param) && value) {
        processParams.interactiveMode = false

        setProcessParam('interactiveMode', false)

        for (const param in devParams) {
          if (isValidProcessParamKey(param)) {
            processParams[param] = false
            setProcessParam(param, false)
          }
        }
      }
    }
  }

  return processParams
}

export function isValidProcessPreferencesKey (key: string): key is keyof typeof process.preferences {
  return key in process.preferences
}

export function loadProcessPreferences (): ProcessPreferences {
  const preferences: ProcessPreferences = {}

  for (const arg of argv)  {
    if (!arg.includes('=')) continue

    const [key, value] = arg.split('=')
    if (!key || !value || !isValidProcessPreferencesKey(key)) continue

    preferences[key] = value
  }
  
  return preferences
}



// === === === === === === === ===
// === Funciones de los videos ===
// === === === === === === === ===

export function addNewVideo (ytId: string, draft?: VideoDraft): Video {
  if (!ytId) {
    throw new Error('Falta especificar el id del video')
  }

  if (!draft) {
    throw new Error('Falta especificar el borrador del video')
  }

  if (!draft.id) {
    throw new Error('Falta el id del borrador')
  }

  if (process.videos.some((video) => video.id === ytId)) {
    throw new Error('El video ya está en la lista')
  }

  const newVideo = new Video(ytId, draft)

  process.videos.push(newVideo)
  
  return newVideo
}

export function getVideoById (id: string) {
  const video = process.videos.find((video) => video.id === id)

  if (!video) {
    throw new Error(`No existe un video con el id: ${id}`)
  }

  return video
}

export function updateVideoData (id: string, newVideoData: Video) {
  if (!id) {
    throw new Error('Falta el id del video')
  }

  if (!newVideoData) {
    throw new Error('Faltan los nuevos datos del video')
  }

  const video = process.videos.find((video) => video.id === id)

  if (!video) return addNewVideo(id, newVideoData)
  
  const newVideo = {
    ...video,
    ...newVideoData
  }

  return newVideo
}
