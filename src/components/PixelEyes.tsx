import { useId } from 'react'

/**
 * A single pixel-art eye (sclera + wandering pupils) extracted from
 * `eyesv1.svg`. The component is self-contained so two instances can
 * be positioned independently to match the rabbit's eye sockets.
 */
interface SingleEyeProps {
  className?: string
  style?: React.CSSProperties
  side: 'left' | 'right'
  scleraColor?: string
  pupilColor?: string
  /** Animation duration in seconds. */
  duration?: number
}

const LEFT_VIEW_BOX = '83 71 115 252'
const RIGHT_VIEW_BOX = '382 71 115 252'

const LEFT_SCLERA =
  'M106.68 71.0329L175.52 71.025L175.541 93.9795L198.466 93.9631L198.509 300.425C190.85 300.377 183.19 300.385 175.531 300.447L175.531 323.437L106.598 323.428L106.678 300.436L83.6146 300.396C83.8006 283.744 83.6434 266.774 83.6431 250.101L83.64 155.072L83.6346 116.799C83.6343 109.347 83.4873 101.388 83.7596 93.9812L106.594 93.9662C106.711 86.359 106.575 78.6768 106.68 71.0329Z'
const RIGHT_SCLERA =
  'M405.303 70.9938C413.101 71.1784 421.48 71.0296 429.315 71.0305L474.087 71.0468L474.107 93.9711L497.041 93.9759C497.397 110.788 497.072 128.898 497.072 145.818L497.069 246.57V280.341C497.069 286.83 496.942 293.935 497.188 300.385C489.556 300.54 481.775 300.329 474.085 300.461L474.15 323.414L405.244 323.397L405.269 300.484C397.731 300.298 389.84 300.413 382.276 300.416L382.265 164.28V119.759C382.265 111.288 382.135 102.4 382.347 93.9564L405.244 93.9654L405.303 70.9938Z'

const LEFT_PUPILS = [
  'M106.445 117L160.956 117.032L161 187L106.342 186.974C106.163 183.981 106.179 180.845 106.281 177.844C106.962 157.635 105.231 137.186 106.445 117Z',
  'M118.251 127L148.975 127.032L149 197L118.193 196.974C118.092 193.981 118.101 190.845 118.158 187.844C118.542 167.635 117.566 147.186 118.251 127Z',
  'M118.251 106L148.975 106.032L149 176L118.193 175.974C118.092 172.981 118.101 169.845 118.158 166.844C118.542 146.635 117.566 126.186 118.251 106Z',
]
const RIGHT_PUPILS = [
  'M405.329 117.017C423.548 116.981 441.767 117.002 459.993 117.08L460 186.974C441.74 187.012 423.474 187.008 405.215 186.961C405.141 163.777 404.71 140.173 405.329 117.017Z',
  'M417.251 127L447.975 127.032L448 197L417.193 196.974C417.092 193.981 417.101 190.845 417.158 187.844C417.542 167.635 416.566 147.186 417.251 127Z',
  'M417.251 106L447.975 106.032L448 176L417.193 175.974C417.092 172.981 417.101 169.845 417.158 166.844C417.542 146.635 416.566 126.186 417.251 106Z',
]

function PixelEye({
  className,
  style,
  side,
  scleraColor = 'white',
  pupilColor = '#232323',
  duration = 9,
}: SingleEyeProps) {
  const id = useId().replace(/[^a-z0-9]/gi, '')
  const wanderName = `pixeleye-wander-${id}`
  const blinkName = `pixeleye-blink-${id}`
  const viewBox = side === 'left' ? LEFT_VIEW_BOX : RIGHT_VIEW_BOX
  const sclera = side === 'left' ? LEFT_SCLERA : RIGHT_SCLERA
  const pupils = side === 'left' ? LEFT_PUPILS : RIGHT_PUPILS

  return (
    <>
      {/* Mirrors the original WanderingEyes keyframe pattern: rest -> left ->
          right -> down -> rest, with blinks interleaved at 11/21/41/61/71/91/99. */}
      <style>{`
        @keyframes ${wanderName} {
          0%, 10% { transform: translate(0, 0); }
          13%, 40% { transform: translate(-18px, 0); }
          43%, 70% { transform: translate(18px, 0); }
          73%, 90% { transform: translate(0, 18px); }
          93%, 100% { transform: translate(0, 0); }
        }
        @keyframes ${blinkName} {
          0%, 10%, 12%, 20%, 22%, 40%, 42%, 60%, 62%, 70%, 72%, 90%, 92%, 98%, 100% {
            transform: scaleY(1);
          }
          11%, 21%, 41%, 61%, 71%, 91%, 99% {
            transform: scaleY(0.05);
          }
        }
      `}</style>
      <svg
        viewBox={viewBox}
        className={className}
        style={style}
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <g
          style={{
            animation: `${blinkName} ${duration}s linear infinite`,
            transformOrigin: '50% 50%',
            transformBox: 'fill-box',
          }}
        >
          <path d={sclera} fill={scleraColor} />
          <g
            style={{
              transform: 'scale(1.2)',
              transformOrigin: '50% 50%',
              transformBox: 'fill-box',
            }}
          >
            <g
              style={{
                animation: `${wanderName} ${duration}s linear infinite`,
              }}
            >
              {pupils.map((d, i) => (
                <path key={i} d={d} fill={pupilColor} />
              ))}
            </g>
          </g>
        </g>
      </svg>
    </>
  )
}

interface PixelEyesProps {
  className?: string
  /** CSS positioning for the LEFT eye, e.g. { top: '62.8%', left: '26%', width: '9.6%', height: '21%' }. */
  leftEye: React.CSSProperties
  /** CSS positioning for the RIGHT eye. */
  rightEye: React.CSSProperties
  scleraColor?: string
  pupilColor?: string
}

export function PixelEyes({
  className,
  leftEye,
  rightEye,
  scleraColor = 'white',
  pupilColor = '#232323',
}: PixelEyesProps) {
  return (
    <div className={className}>
      <PixelEye
        side="left"
        style={{ position: 'absolute', ...leftEye }}
        scleraColor={scleraColor}
        pupilColor={pupilColor}
      />
      <PixelEye
        side="right"
        style={{ position: 'absolute', ...rightEye }}
        scleraColor={scleraColor}
        pupilColor={pupilColor}
      />
    </div>
  )
}
