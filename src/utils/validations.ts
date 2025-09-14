import { spawnAsync } from '../utils/spawnAsync'
// import { writ>eFileSync } from 'node:fs'
import { oraPromise } from 'ora'
import { getVideoIdFromUrl } from './readUrl'
import { Validation } from 'src/env'
import { errorHandler } from './errorHandler'

export async function validateVideoId (video: string | URL): Promise<Validation> {
  let id: string | null = null

  if (video instanceof URL) {
    id = getVideoIdFromUrl(video)
  } else {
    id = video
  }

  if (!id) {
    throw new Error('No se pudo conseguir el id del video')
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
    partialVideo: {
      id,
      title
    }
  }
}
