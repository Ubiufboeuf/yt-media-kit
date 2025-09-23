import type { Video } from './video' 

export interface Process {
  videos: Video[]
  params: ProcessParams
}

export type SearchProcessParams = 'isDevMode' | 'skipValidation' | 'useDefaultVideo'

export interface ProcessParams {
  isDevMode: boolean
  skipValidation: boolean
  useDefaultVideo: boolean
}

export interface VideoOptions {
	askForResolutions: boolean
	downloadVideo: boolean
	forceDownloadVideo: boolean
	forceDownloadAudio: boolean
	syncVideoAndAudio: boolean
	forceSync: boolean
	createDashStream: boolean
	getVideoData: boolean
	getThumbnails: boolean
}
