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
      className="h-auto gap-1.5 rounded-md border-0 bg-[#ebedf0] px-2.5 py-1.5 text-[12px] font-normal tracking-tight text-[#666] hover:bg-[#dee0e3] active:bg-[#d0d3d6] dark:bg-[#222] dark:text-[#a0a0a0] dark:hover:bg-[#2e2e2e] dark:active:bg-[#3a3a3a] [&_svg:not([class*='size-'])]:size-3"
    >
      {email}
    </CopyButton>
  )
}
