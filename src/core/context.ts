import { AsyncLocalStorage } from 'node:async_hooks'

export const videoContext = new AsyncLocalStorage<{ id: string }>()
