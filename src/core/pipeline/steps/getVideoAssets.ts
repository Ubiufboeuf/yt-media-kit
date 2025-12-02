import { videoContext } from 'src/core/context'

export async function getVideoAssets (ytId: string) {
  // Cargar contexto
  const context = videoContext.getStore()
  if (!context) {
    console.error('Falta el contexto del video')
    return
  }

  const videoData = context.yt_dlp_data
  if (!videoData) {
    console.error('Faltan los datos del video en el contexto')
    return
  }
  
  return
}
