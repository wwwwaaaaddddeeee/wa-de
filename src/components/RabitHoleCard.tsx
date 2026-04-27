import { WanderingEyes } from '@/components/loading-ui/wandering-eyes'

export function RabitHoleCard() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-black/[0.04] bg-[#E0E0E0] dark:border-white/5 dark:bg-[#1b1b1b]">
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ width: '110%', aspectRatio: '609 / 580' }}
      >
        <div
          role="img"
          aria-label="rabit hole"
          className="absolute inset-0 bg-[#25192D] dark:bg-[#ededed]"
          style={{
            maskImage: "url('/rabithole.svg')",
            WebkitMaskImage: "url('/rabithole.svg')",
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
        />
        <WanderingEyes
          eyeScale={0.62}
          gapScale={0.69}
          className="absolute dark:[--eye-color:#25192D] dark:[--pupil-color:#ededed]"
          style={
            {
              top: '81.3%',
              left: '53.4%',
              transform: 'translate(-50%, -50%)',
              width: '35%',
              '--eye-color': '#FFFFFF',
              '--pupil-color': '#25192D',
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  )
}
