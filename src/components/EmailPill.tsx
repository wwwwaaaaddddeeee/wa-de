import { CheckIcon } from 'lucide-react'

import { CopyButton } from '@/components/copy-button/copy-button'

export function EmailPill({ email }: { email: string }) {
  return (
    <CopyButton
      text={email}
      size="sm"
      variant="secondary"
      aria-label={`Copy ${email}`}
      doneIcon={<CheckIcon strokeWidth={3} />}
      errorIcon={<CheckIcon strokeWidth={3} />}
      className="h-auto gap-1 rounded-md border-0 bg-black/[0.04] px-2 py-1 text-[11px] font-normal tracking-tight text-[#666] hover:bg-black/[0.06] active:bg-black/[0.08] dark:bg-white/5 dark:text-[#a0a0a0] dark:hover:bg-white/[0.07] dark:active:bg-white/[0.09] [&_svg:not([class*='size-'])]:size-3"
    >
      {email}
    </CopyButton>
  )
}
