import type { Resolution } from 'src/env'
import { DEFAULT_RESOLUTIONS, DEFAULT_VIDEO_OPTIONS, MAX_RESOLUTION_TO_DOWNLOAD } from './constants'

export class VideoDraft {
  id = ''
  title = 'unknown_title'
  options = DEFAULT_VIDEO_OPTIONS
  resolutions = DEFAULT_RESOLUTIONS
  maxResolutionToDownload = MAX_RESOLUTION_TO_DOWNLOAD

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
