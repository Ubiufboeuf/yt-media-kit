import type { Process, SearchProcessParams, VideoOptions } from 'src/core/types'
import type { ProcessParams } from 'src/core/types'
import { Arguments } from 'src/lib/constants'
import { argv } from 'node:process'
import type { Resolution } from 'src/env'

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

const DEFAULT_VIDEO_OPTIONS: VideoOptions = {
  askForResolutions: false,
  downloadVideo: false,
  forceDownloadVideo: false,
  forceDownloadAudio: false,
  syncVideoAndAudio: false,
  forceSync: false,
  createDashStream: false,
  getVideoData: false,
  getThumbnails: false
}

const DEFAULT_RESOLUTIONS: Resolution[] = [
  {
    download: '360p', desired: '360p',
    downloadNumber: 360, desiredNumber: 360
  }
]

export class VideoDraft {
  id = ''
  title = 'unknown_title'
  options = DEFAULT_VIDEO_OPTIONS
  resolutions = DEFAULT_RESOLUTIONS

  constructor (id: string) {
    this.id = id
  }
}

export class Video extends VideoDraft {
  ytId = ''

  constructor (ytId: string, draft: VideoDraft) {
    if (!ytId) {
      throw new Error('Falta especificar el id del video')
    }

    if (!draft) {
      throw new Error('Falta especificar el borrador del video')
    }

    if (!draft.id) {
      throw new Error('Falta el id del borrador')
    }
  
    super(draft.id)

    this.ytId = ytId
    this.title = draft.title
    this.options = draft.options
    this.resolutions = draft.resolutions
  }
}

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

export function isValidResolution (r: unknown): r is Resolution {
  return (
    typeof r === 'object' &&
    r !== null &&
    'download' in r &&
    'desired' in r &&
    'downloadNumber' in r &&
    'desiredNumber' in r &&
    typeof r.download === 'string' &&
    typeof r.desired === 'string' &&
    typeof r.downloadNumber === 'number' &&
    typeof r.desiredNumber === 'number'
  )
}

export function getDefaultVideoOptions () {
  return DEFAULT_VIDEO_OPTIONS
}

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
