import { AsyncLocalStorage } from 'node:async_hooks'
import type { YtdlpJSON } from './yt-dlp.types'

export const videoContext = new AsyncLocalStorage<{ id: string, yt_dlp_data?: YtdlpJSON }>()
