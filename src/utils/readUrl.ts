export function getVideoIdFromUrl (url: URL | string) {
  const validUrl = url instanceof URL ? url : new URL(url)
  const id: string | null = validUrl.searchParams.get('v')

  return id
}
