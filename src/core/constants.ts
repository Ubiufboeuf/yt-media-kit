import type { Resolution } from 'src/env'
import type { ProcessParams, VideoOptions } from './types'

export const DEFAULT_VIDEO_OPTIONS: VideoOptions = {
  askForResolutions: false,
  downloadVideo: false,
  downloadAudio: false,
  forceDownloadVideo: false,
  forceDownloadAudio: false,
  syncVideoAndAudio: true,
  unsyncVideoAndAudio: true,
  forceSync: false,
  forceUnsync: false,
  createDashStream: false,
  getVideoData: false,
  getThumbnails: false
}

export const DEFAULT_RESOLUTIONS: Resolution[] = [
  {
    download: '360p', desired: '360p',
    downloadNumber: 360, desiredNumber: 360
  }
]

export const MAX_RESOLUTION_TO_DOWNLOAD = { desired: '', download: '', desiredNumber: 0, downloadNumber: 0 }

export const devParams: ProcessParams = {
  interactiveMode: true,
  isDevMode: true,
  skipValidation: true,
  useDefaultVideoId: true
}

export const Arguments = {
	help: '--help',
	version: '--version',
	dev: '--dev',
	skipValidation: '--skip-validation',
	useDefaultVideoId: '--use-default-video-id'
}

export const listOfParamsToCancelInteractiveMode: (Partial<keyof ProcessParams>)[] = [
  'help',
  'version'
]
