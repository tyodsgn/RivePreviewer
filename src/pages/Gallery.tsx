import { useState, useEffect } from 'react'
import { getAllRives, getRiveById, type RiveRecord } from '../db'
import { RiveCard } from '../components/RiveCard'
import { PreviewModal } from '../components/PreviewModal'

export function Gallery() {
  const [rives, setRives] = useState<RiveRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<RiveRecord | null>(null)

  const loadRives = () => {
    setLoading(true)
    getAllRives()
      .then(setRives)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRives()
  }, [])

  // Deep-link: open a specific rive from the URL query param
  useEffect(() => {
    if (loading) return

    const params = new URLSearchParams(window.location.search)
    const riveId = params.get('rive')
    if (!riveId) return

    // First check if it's already in the loaded list
    const found = rives.find((r) => r.id === riveId)
    if (found) {
      setPreview(found)
    } else {
      // Fallback: fetch by id directly from IndexedDB
      getRiveById(riveId).then((record) => {
        if (record) setPreview(record)
      })
    }
  }, [loading, rives])

  // Listen for browser back/forward to sync modal state with URL
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const riveId = params.get('rive')
      if (!riveId) {
        setPreview(null)
      } else {
        const found = rives.find((r) => r.id === riveId)
        if (found) {
          setPreview(found)
        } else {
          getRiveById(riveId).then((record) => {
            if (record) setPreview(record)
          })
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [rives])

  const handleOpen = (r: RiveRecord) => {
    setPreview(r)
    const url = new URL(window.location.href)
    url.searchParams.set('rive', r.id)
    window.history.pushState({}, '', url.toString())
  }

  const handleClose = () => {
    setPreview(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('rive')
    window.history.pushState({}, '', url.toString())
  }

  if (loading) {
    return (
      <div className="gallery gallery--loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (rives.length === 0 && !preview) {
    return (
      <div className="gallery gallery--empty">
        <p>No Rive files yet.</p>
        <p className="gallery__hint">Go to Admin to upload some.</p>
      </div>
    )
  }

  return (
    <>
      <div className="gallery">
        {rives.map((r) => (
          <RiveCard
            key={r.id}
            buffer={r.buffer}
            name={r.name}
            onClick={() => handleOpen(r)}
          />
        ))}
      </div>
      {preview && (
        <PreviewModal
          key={preview.id}
          id={preview.id}
          buffer={preview.buffer}
          name={preview.name}
          onClose={handleClose}
        />
      )}
    </>
  )
}
