import imageCompression from 'browser-image-compression'

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/jpeg',
  })
}

export function generateImagePath(
  customerId: string,
  visitId: string,
): string {
  const uuid = crypto.randomUUID()
  return `${customerId}/${visitId}/${uuid}.jpg`
}
