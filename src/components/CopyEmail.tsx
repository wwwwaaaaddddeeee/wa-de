"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CopyEmailProps {
  email: string
}

export function CopyEmail({ email }: CopyEmailProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [email])

  return (
    <motion.button
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0"
      style={{ fontSize: "14px" }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
    >
      <span className="underline underline-offset-2" style={{ textDecorationColor: "rgba(0,0,0,0.3)" }}>{email}</span>
      <span style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: "rgba(47, 245, 123, 0.15)",
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2FF57B"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.span>
        ) : (
          <motion.svg
            key="copy"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-40"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </motion.svg>
        )}
      </AnimatePresence>
      </span>
    </motion.button>
  )
}
