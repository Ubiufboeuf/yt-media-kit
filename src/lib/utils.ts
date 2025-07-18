import { spawn } from 'node:child_process'

export async function spawnAsync (command: string, args: string[], showOutput: boolean = false) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args)
    let stdout = ''
    let stderr = ''

    process.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
      if (showOutput) {
        console.log(chunk.toString())
      }
    })

    process.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
      if (showOutput) {
        console.log(chunk.toString())
      }
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(stderr))
      }
    })

    process.on('error', (err) => {
      reject(err)
    })
  })  
}
