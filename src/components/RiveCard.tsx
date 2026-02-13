import { useRive } from '@rive-app/react-webgl2'

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

  return (
    <article
      className="rive-card"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="rive-card__canvas">
        <RiveComponent className="rive-card__rive" />
      </div>
      <p className="rive-card__name">{name}</p>
    </article>
  )
}
