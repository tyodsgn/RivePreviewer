import { useCallback } from 'react'
import { useRive } from '@rive-app/react-webgl2'
import { downloadRivFile } from '../utils/download'

interface RiveCardProps {
  buffer: ArrayBuffer
  name: string
  onClick: () => void
}

export function RiveCard({ buffer, name, onClick }: RiveCardProps) {
  const { rive, RiveComponent } = useRive({
    buffer,
    autoplay: false,
  })

  const handleMouseEnter = () => {
    rive?.reset()
    rive?.play()
  }
  const handleMouseLeave = () => rive?.pause()

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      downloadRivFile(buffer, name)
    },
    [buffer, name],
  )

  return (
    <article
      className="rive-card"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="rive-card__canvas">
        <RiveComponent className="rive-card__rive" />
        <button
          type="button"
          className="rive-card__download"
          onClick={handleDownload}
          title="Download"
          aria-label={`Download ${name}`}
        >
          <DownloadIcon />
        </button>
      </div>
      <p className="rive-card__name">{name}</p>
    </article>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
