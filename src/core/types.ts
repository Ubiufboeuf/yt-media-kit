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

export type VideoMetadata = {
	id: string
	title: string
	duration: number | undefined
	width: number | undefined
	height: number | undefined
	mixedSize: number | undefined // <- este es el peso del audio + video
	audio: AudioMetadata | null
	videos: ResolutionMetadata[]
}

export type AudioMetadata = {
	codec: string
	codec_long_name: string
	channel_layout: string | undefined
	channels: number | undefined
	bit_rate: number
	duration: number
	sample_rate: number | undefined
	size: number | undefined
}

export type ResolutionMetadata = {
	codec: string
	codec_long_name: string
	bit_rate: number
	duration: number
	size: number | undefined
	height: number
	width: number
	aspect_ratio: number
	fps: number | undefined
}
