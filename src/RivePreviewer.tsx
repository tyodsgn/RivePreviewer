import { useRive } from '@rive-app/react-webgl2'

interface RivePreviewerProps {
  buffer: ArrayBuffer
  fileName: string | null
  onClear: () => void
}

export function RivePreviewer({ buffer, fileName, onClear }: RivePreviewerProps) {
  const { rive, RiveComponent } = useRive({
    buffer,
    autoplay: true,
  })

  const handlePlay = () => rive?.play()
  const handlePause = () => rive?.pause()
  const handleStop = () => rive?.stop()
  const handleReset = () => rive?.reset()

  return (
    <div className="previewer">
      <div className="previewer__header">
        <div className="previewer__title">
          <span className="previewer__filename">{fileName ?? 'animation.riv'}</span>
        </div>
        <div className="previewer__controls">
          <button
            type="button"
            className="control-btn control-btn--primary"
            onClick={handlePlay}
            title="Play"
            aria-label="Play animation"
          >
            <PlayIcon />
          </button>
          <button
            type="button"
            className="control-btn"
            onClick={handlePause}
            title="Pause"
            aria-label="Pause animation"
          >
            <PauseIcon />
          </button>
          <button
            type="button"
            className="control-btn"
            onClick={handleStop}
            title="Stop"
            aria-label="Stop animation"
          >
            <StopIcon />
          </button>
          <button
            type="button"
            className="control-btn"
            onClick={handleReset}
            title="Reset"
            aria-label="Reset animation"
          >
            <ResetIcon />
          </button>
        </div>
        <button
          type="button"
          className="previewer__clear"
          onClick={onClear}
          title="Load another file"
        >
          Load another file
        </button>
      </div>

      <div className="previewer__canvas-wrapper">
        <RiveComponent className="previewer__canvas" />
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  )
}
