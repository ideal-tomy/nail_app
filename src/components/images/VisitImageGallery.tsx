import { useState } from 'react'
import type { VisitImage } from '../../types/database'
import { SignedImage } from './SignedImage'
import { ImageLightbox } from './ImageLightbox'

interface VisitImageGalleryProps {
  images: VisitImage[]
  altPrefix: string
  variant?: 'hero' | 'history'
}

export function VisitImageGallery({
  images,
  altPrefix,
  variant = 'history',
}: VisitImageGalleryProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-blush text-sm text-mauve">
        完成画像はまだありません
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <>
        <SignedImage
          storagePath={images[0].storage_path}
          alt={`${altPrefix} メイン`}
          className="aspect-[4/3] w-full"
          onClick={() => setSelectedPath(images[0].storage_path)}
        />
        {images.length > 1 && (
          <div className="grid grid-cols-2 gap-2 p-4 pt-3">
            {images.slice(1).map((image, index) => (
              <SignedImage
                key={image.id}
                storagePath={image.storage_path}
                alt={`${altPrefix} ${index + 2}`}
                className="aspect-square rounded-2xl"
                onClick={() => setSelectedPath(image.storage_path)}
              />
            ))}
          </div>
        )}
        <ImageLightbox
          storagePath={selectedPath}
          alt={altPrefix}
          onClose={() => setSelectedPath(null)}
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {images.map((image, index) => (
          <SignedImage
            key={image.id}
            storagePath={image.storage_path}
            alt={`${altPrefix} ${index + 1}`}
            className="aspect-[4/3] w-full rounded-2xl"
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
