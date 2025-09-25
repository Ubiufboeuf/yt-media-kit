import type { Video } from './video' 

export interface Process {
  videos: Video[]
  params: ProcessParams
}

export type SearchProcessParams = 'help' | 'isDevMode' | 'skipValidation' | 'useDefaultVideoId'

export interface ProcessParams {
	help?: boolean
	version?: boolean
  isDevMode?: boolean
  skipValidation?: boolean
  useDefaultVideoId?: boolean
}

export interface VideoOptions {
	askForResolutions: boolean
	downloadVideo: boolean
	forceDownloadVideo: boolean
	forceDownloadAudio: boolean
	syncVideoAndAudio: boolean
	unsyncVideoAndAudio: boolean
	forceSync: boolean
	forceUnsync: boolean
	createDashStream: boolean
	getVideoData: boolean
	getThumbnails: boolean
}
