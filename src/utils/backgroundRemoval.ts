import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal'

export async function removeBackground(imageSrc: string | Blob | File): Promise<string> {
  const result = await imglyRemoveBackground(imageSrc)
  return URL.createObjectURL(result)
}
