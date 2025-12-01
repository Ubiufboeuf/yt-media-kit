import { readdir, stat, writeFile } from 'node:fs/promises'
import type { FormatMetadata, Stream } from 'src/core/ffmpeg.types'
import type { AudioMetadata, ResolutionMetadata, VideoMetadata } from 'src/core/types'
import type { Video } from 'src/core/video'
import type { YtdlpJSON } from 'src/core/yt-dlp.types'
import { Rutas } from 'src/lib/constants'
import { errorHandler } from 'src/utils/errorHandler'
import { spawnAsync } from 'src/utils/spawnAsync'

export async function getVideoData (ytId: string, video: Video) {
  let carpetaVideosConAudio: string[] = []
  let carpetaVideos: string[] = []
  let carpetaAudios: string[] = []

  const videoData: VideoMetadata = {
    id: undefined,
    title: undefined,
    uploader_id: undefined,
    uploader: undefined,
    channel_is_verified: undefined,
    channel_follower_count: undefined,
    upload_date: undefined,
    duration: undefined,
    height: undefined,
    width: undefined,
    mixed_size: undefined,
    aspect_ratio: undefined,
    audio: null,
    videos: [],
    min_video_resolution: undefined,
    max_video_resolution: undefined,
    timestamp: -1
  }

  videoData.id = ytId

  let carpetaVideosTerminados: string[] = []
  try {
    carpetaVideosTerminados = await readdir(`${Rutas.terminados}/${ytId}`)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta del video')
    return
  }

  try {
    carpetaVideosConAudio = await readdir(Rutas.videos_con_audio)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de los videos con audio')
  }

  try {
    carpetaVideos = await readdir(Rutas.videos)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de los videos')
  }

  try {
    carpetaAudios = await readdir(Rutas.audios)
  } catch (err) {
    errorHandler(err, 'Error leyendo la carpeta de los audios')
  }

  const params = ['-j', `https://youtube.com/watch?v=${ytId}`]
  let process
  try {
    process = await spawnAsync('yt-dlp', params)
  } catch (err) {
    errorHandler(err, 'Error consiguiendo los datos del video')
    return
  }

  let json: YtdlpJSON
  try {  
    json = JSON.parse(process.toString())
  } catch (err) {
    errorHandler(err, 'Error parseando la salida de los datos del video')
    return
  }

  videoData.title = json.title
  videoData.uploader = json.uploader
  videoData.uploader_id = json.uploader_id
  videoData.channel_follower_count = json.channel_follower_count
  videoData.channel_is_verified = json.channel_is_verified
  videoData.timestamp = json.timestamp ?? -1

  // Primero el principal (video + audio)
  const videoConAudio = carpetaVideosConAudio.find((v) => v.includes(ytId))
  if (videoConAudio) {
    try {
      await getMixedVideoData(videoConAudio, videoData)
    } catch (err) {
      errorHandler(err, 'Error consiguiendo los datos del audio')
    }
  }
  
  // Luego los formatos (terminados/)
  for (const formatFolder of carpetaVideosTerminados) {
    try {
      const stats = await stat(`${Rutas.terminados}/${ytId}/${formatFolder}`)
      if (!stats.isDirectory()) continue
    } catch (err) {
      errorHandler(err, `Error leyendo los metadatos del archivo ${formatFolder}`)
      continue
    }

    if (formatFolder === 'audio') {
      const file = carpetaAudios.find((f) => f.includes(ytId))
      if (!file) {
        errorHandler(null, 'No se encontró el video')
        continue
      }

      const metadata = await getFileMetadata(file, Rutas.audios)
      if (!metadata) continue

      const { streams } = metadata

      let audioMetadata: AudioMetadata | undefined
      try {
        audioMetadata = await getAudioData(file, streams)
      } catch (err) {
        errorHandler(err, 'Error consiguiendo los datos del audio')
      }

      if (!audioMetadata) continue

      videoData.audio = audioMetadata
    }

    if (formatFolder !== 'audio') {
      const file = carpetaVideos.find((f) => f.includes(ytId) && f.includes(formatFolder))
      if (!file) {
        errorHandler(null, `No se encontró el video para la resolución ${formatFolder}`)
        continue
      }
      
      const metadata = await getFileMetadata(file, Rutas.videos)
      if (!metadata) continue

      const { streams } = metadata

      let resolutionMetadata: ResolutionMetadata | undefined
      try {
        resolutionMetadata = await getResolutionData(file, streams)
      } catch (err) {
        errorHandler(err, 'Error consiguiendo los datos del video')
      }

      if (!resolutionMetadata) continue

      const idx = videoData.videos.findIndex((v) => v.height === resolutionMetadata.height)
      if (idx === -1) {
        videoData.videos.push(resolutionMetadata)
        continue
      }

      videoData.videos[idx] = resolutionMetadata
    }
  }

  if (!videoConAudio) {
    const { desiredNumber } = video.maxResolutionToDownload
    const resolution = videoData.videos.find((v) => v.height === desiredNumber) || videoData.videos[0]

    if (!resolution) {
      // Esto puede que tenga que cambiarlo en un futuro si permito subir sólo música
      errorHandler(null, 'No se guardó ninguna resolución del video')
      return
    }

    videoData.duration = resolution.duration ?? -1
    videoData.height = resolution.height ?? -1
    videoData.width = resolution.width ?? -1
    videoData.aspect_ratio = resolution.aspect_ratio
    videoData.aspect_ratio = resolution.aspect_ratio
  }
  
  try {
    await writeFile(`${Rutas.info}/${ytId}.json`, JSON.stringify(videoData, null, 2))
  } catch (err) {
    errorHandler(err, 'Error guardando los datos del video')
  }
}

async function getFileMetadata (file: string, path: string) {
  const params = ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', `${path}/${file}`]
  
  let metadataAsText
  try {
    metadataAsText = await spawnAsync('ffprobe', params)
  } catch (err) {
    errorHandler(err, `Error consiguieno los metadatos del formato ${file}`)
    return
  }

  let metadata: FormatMetadata
  try {
    metadata = JSON.parse(metadataAsText)
  } catch (err) {
    errorHandler(err, `Error parseando los metadatos del formato ${file}`)
    return
  }

  return metadata
}

async function getMixedVideoData (videoConAudio: string, videoData: VideoMetadata) {
  let mixedSize: number | undefined
  try {
    mixedSize = (await stat(`${Rutas.videos_con_audio}/${videoConAudio}`)).size
  } catch (err) {
    errorHandler(err, 'Error consiguiendo el tamaño del video con audio')
  }

  if (mixedSize) videoData.mixed_size = mixedSize

  const metadata = await getFileMetadata(videoConAudio, Rutas.videos_con_audio)  
  if (!metadata) return

  const { format, streams } = metadata
  const video = streams.find((s) => s.codec_type === 'video')

  if (!video) return

  videoData.duration = num(format.duration)
  videoData.height = video.height ?? -1
  videoData.width = video.width ?? -1
}

async function getAudioData (file: string, streams: Stream[]) {
  const audio = streams.find((s) => s.codec_type === 'audio')
  if (!audio) return

  let size: number | undefined
  try {
    size = (await stat(`${Rutas.audios}/${file}`)).size
  } catch (err) {
    errorHandler(err, 'Error consiguiendo el tamaño del audio')
  }

  const audioData: AudioMetadata = {
    codec: audio.codec_name ?? 'unknown',
    codec_long_name: audio.codec_long_name ?? 'unknown',
    channel_layout: audio.channel_layout ?? 'unknown',
    channels: num(audio.channels),
    bit_rate: num(audio.bit_rate),
    bit_rate_kbps: num(audio.bit_rate) / 1000,
    duration: num(audio.duration),
    sample_rate: audio.sample_rate === undefined ? undefined : Number(audio.sample_rate),
    size
  }

  return audioData
}

async function getResolutionData (file: string, streams: Stream[]) {
  const video = streams.find((s) => s.codec_type === 'video')
  if (!video) return

  let size: number | undefined
  try {
    size = (await stat(`${Rutas.videos}/${file}`)).size
  } catch (err) {
    errorHandler(err, `Error consiguiendo el tamaño de la resolución ${file}`)
  }

  const fps = getFps(video) ?? undefined
  const width = num(video.width)
  const height = num(video.height)
  const aspect_ratio = video.display_aspect_ratio

  const resolution: ResolutionMetadata = {
    codec: video.codec_name ?? 'unknown',
    codec_long_name: video.codec_long_name ?? 'unknown',
    bit_rate: num(video.bit_rate),
    bit_rate_kbps: num(video.bit_rate) / 1000,
    duration: num(video.duration),
    width,
    height,
    aspect_ratio,
    size,
    fps
  }
  
  return resolution
}

function getFps (stream: Stream) {
  const rate = stream.avg_frame_rate || stream.r_frame_rate
  if (!rate || rate === '0/0') return undefined

  const [num, den] = rate.split('/').map(Number)
  if (!num || !den) return undefined

  return num / den
}

function num (v: unknown) {
  const n = Number(v)
  if (isNaN(n)) return -1
  return n
}
