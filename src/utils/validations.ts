import { YT_DLP } from '@/lib/constants'
import { spawn } from 'node:child_process'
// import { EOL } from 'node:os'
import { oraPromise } from 'ora'

export async function validateVideoId (videoId: string) {
  const validatePromise = new Promise((resolve, reject) => {
    const ytDlpParams = [
      '--get-title',
      `https://www.youtube.com/watch?v=${videoId}`
    ]

    const ytDlp = spawn(YT_DLP, ytDlpParams)

    ytDlp.on('close', (code) => {
      if (code === 0) {
        resolve(code)
      } else {
        const error = new Error('ID inválido', { cause: videoId })
        reject(error)
      }
    })
  })

  try {
    await oraPromise(validatePromise, { text: 'Verificando', successText: 'Verificado' })
    return true
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message)
    } else {
      console.error('Error validando el id del video')
    }
  }
}

// export async function validateDirectories (videoId: string) {
//   const validatePromise = new Promise((resolve, reject) => {
    
//   })
  
//   try {
//     await oraPromise(validatePromise, 'Verificando directorios')
//   } catch (err) {
//     if (err instanceof Error) {
//       console.error(err.message)
//     } else {
//       console.error(`Error validando los directorios para ${videoId}`)
//     }
//   }
// }


// try {
//   if (err instanceof Error) {
//     throw new Error(err.message, { cause: err.cause })
//   } else if (typeof err === 'string') {
//     throw new Error('Error validando el id')
//   } else if (typeof err === 'number') {
//     throw new Error(`Proceso terminado con código ${err}`)
//   }
//   throw new Error('Error')
// } catch (err) {
//   return err
// }
