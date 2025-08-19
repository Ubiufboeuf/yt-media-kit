export function getSizeInMiB (size: string) {
  let sizeInMiB = 0
  if (size.includes('G')) {
    const sp = size.split('G')[0]
    sizeInMiB = sp ? Number(sp) * 1024 : sizeInMiB
  } else if (size.includes('M')) {
    const sp = size.split('M')[0]
    sizeInMiB = sp ? Number(sp) : sizeInMiB
  } else if (size.includes('K')) {
    const sp = size.split('K')[0]
    sizeInMiB = sp ? Number(sp) / 1024 : sizeInMiB
  }
  return sizeInMiB
}
