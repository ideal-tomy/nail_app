import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSignedUrl(storagePath: string | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(storagePath))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storagePath) {
      setUrl(null)
      setLoading(false)
      return
    }

    // 開発用: public/images のローカル画像（storage_path = local/nail01.jpg）
    if (storagePath.startsWith('local/')) {
      setUrl(`/${storagePath.replace('local/', 'images/')}`)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    supabase.storage
      .from('nail-images')
      .createSignedUrl(storagePath, 3600)
      .then(({ data, error: signedError }) => {
        if (cancelled) return
        if (signedError) {
          setError(signedError.message)
          setUrl(null)
        } else {
          setUrl(data.signedUrl)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [storagePath])

  return { url, loading, error }
}
