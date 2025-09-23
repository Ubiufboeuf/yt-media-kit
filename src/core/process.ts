import type { Process, SearchProcessParams } from 'src/core/types'
import type { ProcessParams } from 'src/core/types'
import { Arguments } from 'src/lib/constants'
import { argv } from 'node:process'
import {devParams } from './constants'
import { Video, type VideoDraft } from './video'

const process: Process = {
  videos: [],
  params: {
    isDevMode: false,
    skipValidation: false,
    useDefaultVideo: false
  }
}

// === === === === === === === ===
// ===  Funciones del proceso  ===
// === === === === === === === ===

export function setProcessParam (param: SearchProcessParams, value: boolean) {
  if (Object.keys(process.params).includes(param)) {
    process.params[param] = value
  }
}

export function isValidProcessParamKey (key: string): key is keyof typeof process.params {
  return key in process.params
}

export function getProcessParam (param: SearchProcessParams) {
  if (Object.keys(process.params).includes(param)) {
    return process.params[param]
  }
}

export function loadProcessParams (): ProcessParams {  
  const skipValidation = argv.some((a) => a.toLowerCase() === Arguments.skipValidation)
  const useDefaultVideo = argv.some((a) => a.toLowerCase() === Arguments.useDefaultVideo)
  const isDevMode = argv.some((a) => a.toLowerCase() === Arguments.dev)

  const processParams = {
    skipValidation,
    useDefaultVideo,
    isDevMode,
    ...(isDevMode ? devParams : {})
  }

  for (const [key, param] of Object.entries(processParams)) {
    if (isValidProcessParamKey(key)) {
      setProcessParam(key, param)
    }
  }
  
  return processParams
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
