import { SignedImage } from './SignedImage'

interface ImageLightboxProps {
  storagePath: string | null
  alt: string
  onClose: () => void
}

export function ImageLightbox({ storagePath, alt, onClose }: ImageLightboxProps) {
  if (!storagePath) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[85dvh] w-full max-w-lg overflow-hidden rounded-3xl">
        <SignedImage
          storagePath={storagePath}
          alt={alt}
          className="max-h-[85dvh] rounded-3xl object-contain"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-sm text-porcelain"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
