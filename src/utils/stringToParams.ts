export function stringToParams (str: string): string[] {
  const params = str
    .replaceAll('\'', '')
    .replaceAll('"', '')
    .split(' ')
  return params
}
