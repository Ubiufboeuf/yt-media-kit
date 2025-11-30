import { readdir } from 'node:fs/promises'
import type { Video } from 'src/core/video'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { spawnAsync } from 'src/utils/spawnAsync'

export async function createStreams (ytId: string, video: Video) {
  let carpetaVideoTerminado: string[]
  try {
    carpetaVideoTerminado = await readdir(`${Rutas.terminados}/${ytId}`)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta del video terminado')
    return
  }

  if (carpetaVideoTerminado.includes('manifest.mpd')) {
    console.log('(Streams ya creados, omitiendo)')
    return
  }

  let carpetaVideosProcesado: string[]
  try {
    carpetaVideosProcesado = await readdir(Rutas.videos)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de videos procesados')
    return
  }
  
  if (!carpetaVideosProcesado.some((file) => file.includes(ytId))) {
    console.log('\n(No se encontró el video en la lista de procesados, omitiendo)')
    return
  }

  const paramsFragments = {
    '32p': `${Rutas.videos}/[32p]-${ytId}.mp4#video:id=32p/32p:dst=${Rutas.terminados}/${ytId}/32p`,
    '144p': `${Rutas.videos}/[144p]-${ytId}.mp4#video:id=144p/144p:dst=${Rutas.terminados}/${ytId}/144p`,
    '360p': `${Rutas.videos}/[360p]-${ytId}.mp4#video:id=360p/360p:dst=${Rutas.terminados}/${ytId}/360p`,
    '720p': `${Rutas.videos}/[720p]-${ytId}.mp4#video:id=720p/720p:dst=${Rutas.terminados}/${ytId}/720p`,
    'audio': `${Rutas.audios}/${ytId}.mp4#audio:id=audio/audio:role=main:dst=${Rutas.terminados}/${ytId}/audio`
  }

  const params = ['-dash', '4000', '-frag', '4000', '-rap', '--stl', '-segment-name', '$RepresentationID$_', '-fps', '24']
  let someResolution = false
  
  for (const { desired } of video.resolutions) {
    if (!paramsFragments[desired as keyof typeof paramsFragments]) continue

    someResolution = true
    params.push(paramsFragments[desired as keyof typeof paramsFragments])
  }

  if (video.options.downloadAudio) params.push(paramsFragments.audio)

  params.push('-out', `${Rutas.terminados}/${ytId}/manifest.mpd`)

  if (!someResolution) {
    console.error('No se encontró ninguna resolución válida del video')
    return
  }

  await spawnAsync('mp4box', params)
}
