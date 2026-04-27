import { useEffect, useRef } from 'react'
import { CheckIcon } from 'lucide-react'

import { CopyButton } from '@/components/copy-button/copy-button'

export function EmailPill({ email }: { email: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)

  // Publish the pill's intrinsic width as a CSS var so siblings
  // (e.g. Earworm) can match its length.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const publish = () =>
      document.documentElement.style.setProperty(
        '--email-pill-w',
        `${el.offsetWidth}px`,
      )
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="inline-flex">
      <CopyButton
        text={email}
        size="sm"
        variant="secondary"
        aria-label={`Copy ${email}`}
        doneIcon={<CheckIcon strokeWidth={3} />}
        errorIcon={<CheckIcon strokeWidth={3} />}
        className="h-auto gap-1 rounded-[5px] border-0 bg-black/[0.04] px-2 py-1 text-[11px] font-normal tracking-tight text-[#666] hover:bg-black/[0.06] active:bg-black/[0.08] dark:bg-white/5 dark:text-[#a0a0a0] dark:hover:bg-white/[0.07] dark:active:bg-white/[0.09] [&_svg:not([class*='size-'])]:size-3"
      >
        {email}
      </CopyButton>
    </div>
  )
}
