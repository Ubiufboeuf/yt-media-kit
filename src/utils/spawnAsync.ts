import { spawn } from 'node:child_process'
import { YT_DLP } from '../lib/constants'

export async function spawnAsync (
  command: 'yt-dlp' | 'ffmpeg',
  args: string[],
  showOutput: boolean = false
): Promise<string> {
  if (command === 'yt-dlp') command = YT_DLP
  
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
