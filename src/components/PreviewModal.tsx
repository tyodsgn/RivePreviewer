import { useCallback, useEffect, useRef, useState } from 'react'
import { useRive, Layout, Fit, EventType } from '@rive-app/react-webgl2'

interface PreviewModalProps {
  id: string
  buffer: ArrayBuffer
  name: string
  onClose: () => void
}

export function PreviewModal({ id, buffer, name, onClose }: PreviewModalProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLooping, setIsLooping] = useState(false)
  const [copied, setCopied] = useState(false)
  const closingRef = useRef(false)
  const loopRef = useRef(false)

  const { rive, RiveComponent } = useRive({
    buffer,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain }),
  })

  // Keep loopRef in sync with state so the event handler always has the latest value
  useEffect(() => {
    loopRef.current = isLooping
  }, [isLooping])

  // Listen for stop / play / pause events
  useEffect(() => {
    if (!rive) return

    const handleStop = () => {
      if (closingRef.current) return
      if (loopRef.current) {
        try {
          rive.reset()
          rive.play()
        } catch {
          // ignore
        }
      } else {
        setIsPlaying(false)
      }
    }

    const handlePlay = () => {
      if (!closingRef.current) setIsPlaying(true)
    }
    const handlePause = () => {
      if (!closingRef.current) setIsPlaying(false)
    }

    rive.on(EventType.Stop, handleStop)
    rive.on(EventType.Play, handlePlay)
    rive.on(EventType.Pause, handlePause)
    return () => {
      rive.off(EventType.Stop, handleStop)
      rive.off(EventType.Play, handlePlay)
      rive.off(EventType.Pause, handlePause)
    }
  }, [rive])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleClose = useCallback(() => {
    closingRef.current = true
    try {
      rive?.stop()
    } catch {
      // ignore
    }
    onClose()
  }, [rive, onClose])

  const togglePlayPause = useCallback(() => {
    if (!rive || closingRef.current) return
    try {
      if (isPlaying) {
        rive.pause()
      } else {
        rive.play()
      }
    } catch {
      // ignore
    }
  }, [rive, isPlaying])

  const handleRestart = useCallback(() => {
    if (!rive || closingRef.current) return
    try {
      rive.reset()
      rive.play()
      setIsPlaying(true)
    } catch {
      // ignore
    }
  }, [rive])

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev)
  }, [])

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}?rive=${id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [id])

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Preview: ${name}`}
      >
        <div className="modal__header">
          <span className="modal__title">{name}</span>
          <div className="modal__controls">
            <button
              type="button"
              className="control-btn control-btn--primary"
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              type="button"
              className="control-btn"
              onClick={handleRestart}
              title="Restart"
              aria-label="Restart"
            >
              <ResetIcon />
            </button>
            <button
              type="button"
              className={`control-btn ${isLooping ? 'control-btn--active' : ''}`}
              onClick={toggleLoop}
              title={isLooping ? 'Looping' : 'Loop off'}
              aria-label="Toggle loop"
            >
              <LoopIcon />
            </button>
            <button
              type="button"
              className="control-btn"
              onClick={handleShare}
              title={copied ? 'Copied!' : 'Copy share link'}
              aria-label="Share"
            >
              {copied ? <CheckIcon /> : <ShareIcon />}
            </button>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="modal__body">
          <div className="modal__canvas-wrap">
            <RiveComponent className="modal__canvas" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  )
}

function LoopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
