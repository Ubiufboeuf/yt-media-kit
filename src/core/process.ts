import { Process, SearchProcessParams, Video } from 'src/core/types'
import { ProcessParams } from 'src/core/types'
import { Arguments } from 'src/lib/constants'
import { argv } from 'node:process'

const process: Process = {
  videos: [],
  params: {
    isDevMode: false,
    skipValidation: false,
    useDefaultVideo: false
  }
}

const devParams: ProcessParams = {
  isDevMode: true,
  skipValidation: true,
  useDefaultVideo: true
}

const DEFAULT_VIDEO_OPTIONS = {
  askForResolutions: false,
  downloadVideo: false,
  forceDownloadVideo: false,
  forceDownloadAudio: false,
  syncVideoAndAudio: false,
  forceSync: false,
  getVideoData: false,
  getThumbnails: false
}

export function addNewVideo (id?: string | null, videoData?: Video): Video {
  if (!id) {
    throw new Error('Falta el id del video')
  }

  if (process.videos.some((video) => video.id === id)) {
    throw new Error('El video ya está en la lista')
  }

  const newVideo = {
    ...videoData,
    id,
    title: '',
    options: DEFAULT_VIDEO_OPTIONS
  }

  process.videos.push(newVideo)
  
  return newVideo
}

export function getVideoDataById (id: string) {
  const video = process.videos.find((video) => video.id === id)

  if (!video) {
    throw new Error(`No existe un video con el id ${id}`)
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

export function getDefaultVideoOptions () {
  return DEFAULT_VIDEO_OPTIONS
}

export function setProcessParam (param: SearchProcessParams, value: boolean) {
  if (Object.keys(process.params).includes(param)) {
    process.params[param] = value
  }
}

export function getProcessParam (param: SearchProcessParams) {
  if (Object.keys(process.params).includes(param)) {
    return process.params[param]
  }
}

export function loadProcessParams (): ProcessParams {
  const isDevMode = argv.some(a => a.toLowerCase() === Arguments.dev)
  setProcessParam('isDevMode', isDevMode)
  
  const skipValidation = argv.some(a => a.toLowerCase() === Arguments.skipValidation)
  setProcessParam('skipValidation', skipValidation)

  const useDefaultVideo = argv.some(a => a.toLowerCase() === Arguments.useDefaultVideo)
  setProcessParam('useDefaultVideo', useDefaultVideo)

  return {
    ...(isDevMode ? devParams : {}),
    isDevMode,
    skipValidation,
    useDefaultVideo
  }
}