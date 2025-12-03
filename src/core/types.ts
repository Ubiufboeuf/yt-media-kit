import type { Video } from './video' 
import type { YtdlpJSON } from './yt-dlp.types'

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
	id: string | undefined
	title: string | undefined
	uploader: string | undefined
	uploader_id: string | undefined
	channel_follower_count: number | undefined
	channel_is_verified: boolean | undefined
	upload_date: string | undefined
	duration: number | undefined
	width: number | undefined
	height: number | undefined
	mixed_size: number | undefined // <- este es el peso del audio + video
	aspect_ratio: string | undefined
	audio: AudioMetadata | null
	videos: ResolutionMetadata[]
	thumbnails: Thumbnail[]
	min_video_resolution: string | undefined
	max_video_resolution: string | undefined
	min_thumbnail: string | undefined
	max_thumbnail: string | undefined
	timestamp: number
	__provisional?: {
		thumbnails: YtdlpJSON['thumbnails']
	}
}

export type AudioMetadata = {
	codec: string
	codec_long_name: string
	channel_layout: string | undefined
	channels: number | undefined
	bit_rate: number
	bit_rate_kbps: number
	duration: number
	sample_rate: number | undefined
	size: number | undefined
}

export type ResolutionMetadata = {
	codec: string
	codec_long_name: string
	bit_rate: number
	bit_rate_kbps: number
	duration: number
	size: number | undefined
	height: number
	width: number
	aspect_ratio: string | undefined
	fps: number | undefined
}

export type Thumbnail = {
  id: string
  height: number
  width: number
  url: string | null
}
