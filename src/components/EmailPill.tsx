import { useState } from 'react'

export function EmailPill({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 rounded-md bg-[#e8e8e8] px-2.5 py-1.5 text-[12px] text-[#666] transition-colors hover:bg-[#dcdcdc] active:bg-[#d0d0d0]"
      aria-label={`Copy ${email}`}
    >
      <CopyIcon />
      <span className="tracking-tight">{copied ? 'Copied' : email}</span>
    </button>
  )
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
      <path d="M9 3v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V3" />
      <rect x="9" y="3" width="8" height="6" rx="1" />
    </svg>
  )
}
