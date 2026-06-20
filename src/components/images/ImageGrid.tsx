import { useState } from 'react'
import type { VisitImage } from '../../types/database'
import { SignedImage } from './SignedImage'
import { ImageLightbox } from './ImageLightbox'

interface ImageGridProps {
  images: VisitImage[]
  altPrefix: string
}

export function ImageGrid({ images, altPrefix }: ImageGridProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  if (images.length === 0) {
    return <p className="text-sm text-mauve">完成画像はまだありません</p>
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <SignedImage
            key={image.id}
            storagePath={image.storage_path}
            alt={`${altPrefix} ${index + 1}`}
            className="aspect-square rounded-2xl"
            onClick={() => setSelectedPath(image.storage_path)}
          />
        ))}
      </div>
      <ImageLightbox
        storagePath={selectedPath}
        alt={altPrefix}
        onClose={() => setSelectedPath(null)}
      />
    </>
  )
}
