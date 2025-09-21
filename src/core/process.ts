import type { Process, SearchProcessParams, Video, VideoData } from 'src/core/types'
import type { ProcessParams } from 'src/core/types'
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
  createDashStream: false,
  getVideoData: false,
  getThumbnails: false
}

const DEFAULT_VIDEO_DATA: VideoData = {
  title: 'title_unknown',
  options: DEFAULT_VIDEO_OPTIONS
}

export class VideoDraft {
  title = 'unknown'
  options = DEFAULT_VIDEO_OPTIONS

  setVideoData (videoData: VideoData) {
    this.title = videoData.title
    this.options = videoData.options
  }
}

export class Video extends VideoDraft {
  id = ''

  constructor (id: string, videoData?: VideoData) {
    if (!id) {
      throw new Error('Falta especificar el id del video')
    }
    
    super()

    this.id = id
    this.setVideoData(videoData ?? DEFAULT_VIDEO_DATA)
  }
}

export function addNewVideo (id: string, videoData?: VideoData): Video {
  if (!id) {
    throw new Error('Falta el id del video')
  }

  if (process.videos.some((video) => video.id === id)) {
    throw new Error('El video ya está en la lista')
  }

  const newVideo = new Video(id, videoData)

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

export function isValidProcessParamKey  (key: string): key is keyof typeof process.params {
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
