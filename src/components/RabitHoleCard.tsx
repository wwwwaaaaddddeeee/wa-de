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
      <svg
        aria-hidden="true"
        viewBox="0 0 500 500"
        className="absolute inset-0 h-full w-full text-[#E0E0E0] dark:text-[#363636]"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M225.626 416.389C238.067 416.604 260.698 415.571 272.188 417.088C272.258 424.513 271.95 432.681 271.956 440.223C271.961 447.555 272.213 459.904 271.029 466.682C268.439 467.341 230.482 466.098 225.906 466.051C225.425 450.226 225.805 432.464 225.626 416.389Z"
          fill="currentColor"
        />
      </svg>
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
