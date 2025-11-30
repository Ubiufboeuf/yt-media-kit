import { spawn } from 'node:child_process'
import { BUGS_PATCHES, MP4BOX, YT_DLP } from '../lib/constants'
import { stringToParams } from './stringToParams'

export async function spawnAsync (
  command: 'yt-dlp' | 'ffmpeg' | 'ffprobe' | 'mp4box',
  args: string[],
  showOutput: boolean = false
): Promise<string> {
  if (command === 'yt-dlp') {
    command = YT_DLP as typeof command
    // args.push(...stringToParams(BUGS_PATCHES.YT_DLP.extractor_args))
    args.push('--cookies-from-browser', 'chrome')
  }

  if (command === 'mp4box') {
    command = MP4BOX as typeof command
  }
  
  return new Promise((resolve, reject) => {
    const process = spawn(command, args)
    let stdout = ''
    let stderr = ''

    process.stdout.on('data', (chunk) => {
      const chunkStr = chunk.toString()
      stdout += chunk
      if (showOutput) {
        console.log(chunkStr)
      }
    })

    process.stderr.on('data', (chunk) => {
      const chunkStr = chunk.toString()
      stderr += chunk
      if (showOutput) {
        console.log(chunkStr)
      }
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.toString())
      } else {
        reject(new Error(stderr.toString()))
      }
    })

    process.on('error', (err) => {
      reject(err)
    })
  })  
}
