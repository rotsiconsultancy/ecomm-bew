const UNAVAILABLE_REMOTE_IMAGES = new Set([
  'https://www.somafix.com.tr/dosyalar/page_191/1634035103_1.png',
  'https://www.somafix.com.tr/dosyalar/page_194/1634035370_1.png',
  'https://www.somafix.com.tr/dosyalar/page_193/1634034870_1.png',
])

function normalizeImageSrc(src: string) {
  return src.trim().split(/[?#]/)[0]
}

export function getSafeImageSrc(src: string | null | undefined, fallback: string): string
export function getSafeImageSrc(src: string | null | undefined, fallback?: null): string | null
export function getSafeImageSrc(src: string | null | undefined, fallback: string | null = null) {
  if (!src) return fallback

  const trimmed = src.trim()
  if (!trimmed) return fallback

  return UNAVAILABLE_REMOTE_IMAGES.has(normalizeImageSrc(trimmed)) ? fallback : trimmed
}

export function getFirstSafeImageSrc(images: string[] | null | undefined, fallback: string): string
export function getFirstSafeImageSrc(images: string[] | null | undefined, fallback?: null): string | null
export function getFirstSafeImageSrc(
  images: string[] | null | undefined,
  fallback: string | null = null
) {
  for (const image of images ?? []) {
    const safeImage = getSafeImageSrc(image)
    if (safeImage) return safeImage
  }

  return fallback
}
