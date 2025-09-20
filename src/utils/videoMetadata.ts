import { errorHandler } from './errorHandler'
import { spawnAsync } from './spawnAsync'

export async function getVideoSize (path: string): Promise<null | { height: number, width: number }> {
  let videoSize: { height: number, width: number } | null = null

  const ffprobeParams = ['-v', 'error', '-select_streams','v:0', '-show_entries', 'stream=width,height', '-of', 'csv=s=x:p=0', path]
  try {
    const video = await spawnAsync('ffprobe', ffprobeParams)
    if (video) {
      const [width, height] = video.split('x')
      videoSize = { height: Number(height), width: Number(width) }
    }
  } catch (err) {
    throw errorHandler(err)
  }

  return videoSize
}
