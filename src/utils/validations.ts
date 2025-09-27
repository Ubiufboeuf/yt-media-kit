import { spawnAsync } from '../utils/spawnAsync'
import { oraPromise } from 'ora'
import { getVideoIdFromUrl } from './readUrl'
import type { Validation } from 'src/env'
import { errorHandler } from './errorHandler'
import { DEFAULT_VIDEO_OPTIONS } from 'src/core/constants'

export async function validateVideoId (video: string | URL, downloadVideo: boolean = true, downloadAudio: boolean = true): Promise<Validation> {
  let id: string | null = null

  if (video instanceof URL) {
    id = getVideoIdFromUrl(video)
  } else {
    id = video
  }

  if (!id) {
    throw new Error('No se pudo conseguir el id del video')
  }

  if (!downloadVideo && !downloadAudio) {
    return {
      success: true,
      id: '',
      title: ''
    }
  }

  const ytDlpParams = ['--get-title', `https://www.youtube.com/watch?v=${id}`]
  // const ytDlpParams = ['--dump-json', `https://www.youtube.com/watch?v=${videoId}`]
  const validatePromise = spawnAsync('yt-dlp', ytDlpParams)

  let title = ''
  let success = false
  
  try {
    title = await oraPromise(validatePromise, { text: 'Validando...', successText: 'Validado' })
  } catch (err) {
    throw errorHandler(err, 'Error validando el id del video')
  }

  if (title) {
    success = true
  }

  return {
    success,
    id,
    title
  }
}

export function isValidKeyOfVideoOption (o: string): o is keyof typeof DEFAULT_VIDEO_OPTIONS {
  return o in DEFAULT_VIDEO_OPTIONS
}
