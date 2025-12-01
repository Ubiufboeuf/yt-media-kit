import { videoContext } from 'src/core/context'
import type { Video } from 'src/core/video'
import { errorHandler } from 'src/utils/errorHandler'

export async function getVideoAssets (ytId: string, video: Video) {
  // Cargar contexto
  let context
  try {  
    context = videoContext.getStore()
    if (!context) {
      throw new Error('Falta el contexto')
    }
  } catch (err) {
    errorHandler(err)
    return
  }
  
  return
}
