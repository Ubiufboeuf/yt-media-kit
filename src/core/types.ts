import type { Video } from './video' 

export type Process = {
  videos: Video[]
	mode?: string
  params: ProcessParams
	preferences: ProcessPreferences
}

export type ProcessParams = {
	help?: boolean
	version?: boolean
	interactiveMode: boolean
  isDevMode?: boolean
  skipValidation?: boolean
  useDefaultVideoId?: boolean
}

export type ProcessPreferences = {
	outdir?: string
}

export type VideoOptions = {
	askForResolutions: boolean
	downloadVideo: boolean
	downloadAudio: boolean
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
