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
        className="h-auto gap-1 rounded-[5px] border border-black/[0.04] bg-white px-2 py-1 text-[11px] font-normal tracking-tight text-[#1f1f1f] hover:bg-[#fafafa] active:bg-[#f0f0f0] dark:border-white/5 dark:bg-[#222] dark:text-[#777] dark:hover:bg-[#2e2e2e] dark:active:bg-[#3a3a3a] [&_svg:not([class*='size-'])]:size-3 [&_svg]:text-[#0A0A0D] dark:[&_svg]:text-[#ededed]"
      >
        {email}
      </CopyButton>
    </div>
  )
}
