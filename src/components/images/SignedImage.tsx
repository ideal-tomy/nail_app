import { useSignedUrl } from '../../hooks/useSignedUrl'

interface SignedImageProps {
  storagePath?: string
  alt: string
  className?: string
  onClick?: () => void
}

export function SignedImage({
  storagePath,
  alt,
  className = '',
  onClick,
}: SignedImageProps) {
  const { url, loading, error } = useSignedUrl(storagePath)

  if (!storagePath) {
    return (
      <div
        className={`flex items-center justify-center bg-blush text-sm text-mauve ${className}`}
      >
        画像なし
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`animate-pulse bg-blush ${className}`} aria-label="読み込み中" />
    )
  }

  if (error || !url) {
    return (
      <div
        className={`flex items-center justify-center bg-blush text-xs text-mauve ${className}`}
      >
        読み込み失敗
      </div>
    )
  }

  const image = (
    <img src={url} alt={alt} className={`h-full w-full object-cover ${className}`} />
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`overflow-hidden ${className}`}>
        {image}
      </button>
    )
  }

  return <div className={`overflow-hidden ${className}`}>{image}</div>
}
