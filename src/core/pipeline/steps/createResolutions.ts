import { readdir } from 'node:fs/promises'
import type { Video } from 'src/core/video'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { spawnAsync } from 'src/utils/spawnAsync'

export async function createResolutions (ytId: string, video: Video) {
  let videosProcesados: string[] = []
  try {
    videosProcesados = await readdir(Rutas.videos)
  } catch (err) {
    errorHandler(err, 'Error leyendo la ruta de videos procesados')
    return
  }

  if (!videosProcesados.some((file) => file.includes(ytId))) {
    console.error('No se encontró ninguna resolución del video en la carpeta de procesados, omitiendo')
    return
  }

  const resoluciones = video.resolutions.map((r) => {
    if (videosProcesados.some((file) => file.includes(r.desired))) {
      return { pending: false, r }
    }
    
    return { pending: true, r }
  })
  // console.log(resoluciones)
  if (resoluciones.every((r) => r.pending === false)) {
    console.log('Todas las resoluciones están creadas, omitiendo')
    process.exit(0)
  }
  

  const paramsFragments = {
    '720p': ['-map', '0:v', '-c:v', 'libx264', '-vf', 'scale=1280:720', '-b:v', '3000k', '-maxrate', '3210k', '-bufsize', '6000k', '-g', '24', '-sc_threshold', '0', '-keyint_min', '24', '-x264-params', 'keyint=24:min-keyint=24', '-an', '-f', 'mp4', `${Rutas.videos}/[720p]-${ytId}.mp4`],
    '360p': ['-map', '0:v', '-c:v', 'libx264', '-vf', 'scale=640:360', '-b:v', '1000k', '-maxrate', '1070k', '-bufsize', '2000k', '-g', '24', '-sc_threshold', '0', '-keyint_min', '24', '-x264-params', 'keyint=24:min-keyint=24', '-an', '-f', 'mp4', `${Rutas.videos}/[360p]-${ytId}.mp4`],
    '144p': ['-map', '0:v', '-c:v', 'libx264', '-vf', 'scale=256:144', '-b:v', '400k', '-maxrate', '428k', '-bufsize', '800k', '-g', '24', '-sc_threshold', '0', '-keyint_min', '24', '-x264-params', 'keyint=24:min-keyint=24', '-an', '-f', 'mp4', `${Rutas.videos}/[144p]-${ytId}.mp4`],
    '32p': ['-map', '0:v', '-c:v', 'libx264', '-vf', 'scale=32:18', '-b:v', '8k', '-maxrate', '8k', '-bufsize', '8k', '-g', '24', '-sc_threshold', '0', '-keyint_min', '24', '-x264-params', 'keyint=24:min-keyint=24', '-an', '-f', 'mp4', `${Rutas.videos}/[32p]-${ytId}.mp4`]
  }
  
  const videoName = videosProcesados.find((file) => file.includes(ytId) && file.includes(video.maxResolutionToDownload.download))
  if (!videoName) {
    console.error('Error encontrando un video que debería existir. No toques los archivos en medio del programa, tontón')
    // Si se llega acá y no es por lo que dice el log, perdón, no sos tontón
    return
  }

  const params = ['-i', `${Rutas.videos}/${videoName}`]
  
  for (const { pending, r: res } of resoluciones) {
    if (!pending) continue

    params.push(...paramsFragments[res.desired as keyof typeof paramsFragments])
  }

  try {
    await spawnAsync('ffmpeg', params)
  } catch (err) {
    errorHandler(err, 'Error creando las resoluciones para el video')
  }
}
