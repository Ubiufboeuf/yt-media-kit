import { AsyncLocalStorage } from 'node:async_hooks'
import type { VideoMetadata } from './types'

interface VideoContext {
  id: string
  videoData?: VideoMetadata
}

export const videoContext = new AsyncLocalStorage<VideoContext>()
