'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Globe, X } from 'lucide-react'
import { APK_URL, WEB_URL } from '@/lib/links'

const DISMISS_KEY = 'pulse:landing:download:dismissed:2'

export default function DownloadSuggestion() {
  const [visible, setVisible] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    setIsAndroid(/android/i.test(ua))

    // Show once per session (reappears on the next visit).
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return
    } catch {
      /* ignore */
    }

    const timer = setTimeout(() => setVisible(true), 2600)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const close = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-md rounded-3xl border border-gold/30 bg-navy/95 p-5 shadow-lift backdrop-blur-xl sm:inset-x-auto sm:left-6 sm:mx-0"
        role="dialog"
        aria-label="Get the Pulse app"
      >
        <button
          onClick={close}
          aria-label="Dismiss"
          className="absolute right-4 top-4 rounded-full p-1 text-white/45 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <Image
            src="/appicon.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-xl object-contain"
          />
          <div>
            <h4 className="text-[15px] font-semibold text-white">Take Pulse with you</h4>
            <p className="mt-1 text-[13px] leading-relaxed text-white/60">
              {isAndroid
                ? 'Download the Android build and post, tip and trade on the go.'
                : 'Open Pulse in your browser — or grab the Android build.'}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            href={APK_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className="btn-primary flex-1 py-3"
          >
            <Download className="h-4 w-4" />
            {isAndroid ? 'Download APK' : 'Download for Android'}
          </a>
          <a
            href={WEB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className="btn-ghost flex-1 py-3"
          >
            <Globe className="h-4 w-4" />
            Open the web app
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
