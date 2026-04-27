import { PixelEyes } from '@/components/PixelEyes'

export function RabitHoleCard() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl">
      <picture>
        <source srcSet="/rabithole-dm.svg" media="(prefers-color-scheme: dark)" />
        <img
          src="/rabithole-lm.svg"
          alt="rabit hole"
          width={500}
          height={500}
          className="block h-full w-full"
        />
      </picture>
      <PixelEyes
        className="absolute inset-0"
        leftEye={{
          top: '61.3%',
          left: '25.3%',
          width: '11%',
          height: '24%',
        }}
        rightEye={{
          top: '61.3%',
          left: '62.7%',
          width: '13%',
          height: '24%',
        }}
      />
    </div>
  )
}
