export function getVideoIdFromUrl (url: URL) {
  const id = url.searchParams.get('v')
  return id || null
}