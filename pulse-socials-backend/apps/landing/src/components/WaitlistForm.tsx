'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react'

interface WaitlistFormProps {
  /** Dark surfaces need the light-on-dark treatment; light surfaces the inverse. */
  tone?: 'dark' | 'light'
  compact?: boolean
}

export default function WaitlistForm({ tone = 'dark', compact = false }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [count, setCount] = useState(1247)

  const isDark = tone === 'dark'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // TODO: Replace with the real waitlist endpoint.
      await new Promise((resolve) => setTimeout(resolve, 900))

      setIsSuccess(true)
      setEmail('')
      setCount((prev) => prev + 1)

      setTimeout(() => setIsSuccess(false), 5000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClasses = [
    'peer w-full rounded-full border bg-transparent pl-12 pr-4 outline-none transition',
    'placeholder:text-white/30 focus:placeholder:text-white/50',
    compact ? 'py-3 text-[15px]' : 'py-4 text-base',
    isDark
      ? 'border-white/15 text-white focus:border-gold/70 focus:ring-4 focus:ring-gold/15'
      : 'border-white/60 text-navy placeholder:text-navy/40 focus:border-navy/40 focus:ring-4 focus:ring-navy/10',
  ].join(' ')

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Mail
              aria-hidden
              className={`pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${
                isDark ? 'text-white/35' : 'text-navy/40'
              }`}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              placeholder="you@example.com"
              aria-label="Email address"
              required
              disabled={isLoading || isSuccess}
              className={inputClasses}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="btn-primary btn-lg shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
                Joining…
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="h-[18px] w-[18px]" />
                You&apos;re in
              </>
            ) : (
              <>
                Join waitlist
                <ArrowRight className="h-[18px] w-[18px]" />
              </>
            )}
          </button>
        </div>

        <AnimatePresence initial={false} mode="wait">
          {isSuccess && (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`text-sm font-medium ${isDark ? 'text-teal-soft' : 'text-navy/70'}`}
            >
              You&apos;re on the list — we&apos;ll email you the moment Pulse launches.
            </motion.p>
          )}

          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              role="alert"
              className="text-sm font-medium text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {!compact && !isSuccess && !error && (
          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-navy/50'}`}>
            Join{' '}
            <span className="font-semibold text-gold">{count.toLocaleString()}</span>{' '}
            early adopters on the waitlist. No spam, ever.
          </p>
        )}
      </form>
    </div>
  )
}
