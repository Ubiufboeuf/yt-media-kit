import type { Resolution } from 'src/env'
import type { ProcessParams, ProcessPreferences, VideoOptions } from './types'

export const DEFAULT_PROCESS_PREFERENCES: ProcessPreferences = {
  outdir: undefined
}

export const DEFAULT_VIDEO_OPTIONS: VideoOptions = {
  askForResolutions: false,
  downloadVideo: false,
  downloadAudio: false,
  forceDownloadVideo: false,
  forceDownloadAudio: false,
  syncVideoAndAudio: false,
  unsyncVideoAndAudio: false,
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
	outdir: '--outdir=',
	skipValidation: '--skip-validation',
	useDefaultVideoId: '--use-default-video-id'
}

export const listOfParamsToCancelInteractiveMode: (Partial<keyof ProcessParams>)[] = [
  'help',
  'version'
]
