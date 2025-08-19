import { spawnAsync } from '../utils/spawnAsync'
// import { writ>eFileSync } from 'node:fs'
import { oraPromise } from 'ora'

export async function validateVideoId (videoId: string) {
  const ytDlpParams = ['--get-title', `https://www.youtube.com/watch?v=${videoId}`]
  // const ytDlpParams = ['--dump-json', `https://www.youtube.com/watch?v=${videoId}`]
  const validatePromise = spawnAsync('yt-dlp', ytDlpParams)

  try {
    return await oraPromise(validatePromise, { text: 'Validando...', successText: 'Validado' })
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message)
    } else {
      throw new Error('Error validando el id del video')
    }
  }
}
