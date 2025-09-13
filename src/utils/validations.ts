import { spawnAsync } from '../utils/spawnAsync'
// import { writ>eFileSync } from 'node:fs'
import { oraPromise } from 'ora'
import { getVideoIdFromUrl } from './readUrl'
import { Validation } from 'src/env'
import { errorHandler } from './errorHandler'

const validationError: Validation = {
  success: false,
  error: '',
  video: {
    id: '',
    title: ''
  }
}

export async function validateVideoId (video: string | URL): Promise<Validation> {
  let id: string | null = null

  if (video instanceof URL) {
    id = getVideoIdFromUrl(video)
  } else {
    id = video
  }

  if (!id) {
    validationError.error = 'No se pudo conseguir el id del video'
    return validationError
  }

  const ytDlpParams = ['--get-title', `https://www.youtube.com/watch?v=${id}`]
  // const ytDlpParams = ['--dump-json', `https://www.youtube.com/watch?v=${videoId}`]
  const validatePromise = spawnAsync('yt-dlp', ytDlpParams)

  let title = ''
  let success = false
  
  try {
    title = await oraPromise(validatePromise, { text: 'Validando...', successText: 'Validado' })
  } catch (err) {
    errorHandler(err, 'Error validando el id del video')
  }

  if (title) {
    success = true
  }

  return {
    success,
    video: {
      id,
      title
    }
  }
}
