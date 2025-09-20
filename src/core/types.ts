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

export interface VideoData {
	title: string,
	options: VideoOptions
}

export interface Video extends VideoData {
	id: string
}

export interface VideoOptions {
	askForResolutions: boolean
	downloadVideo: boolean
	forceDownloadVideo: boolean
	forceDownloadAudio: boolean
	syncVideoAndAudio: boolean
	forceSync: boolean
	getVideoData: boolean
	getThumbnails: boolean
}