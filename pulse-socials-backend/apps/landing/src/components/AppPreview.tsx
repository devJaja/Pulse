'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
  Bell,
  Gift,
  Heart,
  Home,
  MessageCircle,
  MessagesSquare,
  Search,
  User,
  Wallet,
} from 'lucide-react'

const NAV = [
  { icon: Home, label: 'Home', active: true },
  { icon: Search, label: 'Search', active: false },
  { icon: Wallet, label: 'Wallet', active: false },
  { icon: MessagesSquare, label: 'Chats', active: false },
  { icon: User, label: 'Profile', active: false },
]

function Gold({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded-full bg-gold ${className}`}
      style={{ background: 'linear-gradient(135deg,#6e54ff,#8270ff 45%,#5a3fe0)' }}
      aria-hidden
    />
  )
}

function PostCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
      <div className="flex items-center gap-2.5">
        <Gold className="h-8 w-8" />
        <div className="min-w-0">
          <div className="h-2.5 w-20 rounded-full bg-white/70" />
          <div className="mt-1.5 h-2 w-14 rounded-full bg-white/25" />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="h-2 w-full rounded-full bg-white/20" />
        <div className="h-2 w-4/5 rounded-full bg-white/20" />
      </div>

      <div className="mt-3.5 flex items-center gap-4 border-t border-white/10 pt-2.5 text-white/35">
        <span className="inline-flex items-center gap-1.5 text-[11px]">
          <Heart className="h-3.5 w-3.5" /> 128
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px]">
          <MessageCircle className="h-3.5 w-3.5" /> 24
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-teal-soft">
          <Gift className="h-3.5 w-3.5" /> Tip
        </span>
      </div>
    </div>
  )
}

export default function AppPreview() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotate: -1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[320px]"
    >
      {/* Glow */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[64px] blur-3xl"
        style={{ background: 'radial-gradient(60% 60% at 50% 40%, rgba(253,219,36,0.20), transparent 70%)' }}
      />

      {/* Device */}
      <div className="rounded-[2.75rem] border border-white/15 bg-navy-deep p-2 shadow-lift">
        <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#fbfaf9] text-ink">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pb-1 pt-3 text-[10px] font-semibold text-[#0e100f]">
            <span>9:41</span>
            <span className="h-1 w-16 rounded-full bg-black/15" />
          </div>

          {/* App bar */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Gold className="h-7 w-7" />
              <div>
                <div className="h-1.5 w-10 rounded-full bg-black/20" />
                <div className="mt-1 h-2 w-16 rounded-full bg-black/70" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10">
                <Bell className="h-3.5 w-3.5 text-black/60" />
              </span>
              <Gold className="h-7 w-7" />
            </div>
          </div>

          {/* Balance */}
          <div className="relative mx-3 overflow-hidden rounded-2xl bg-navy px-4 py-3.5">
            <div
              aria-hidden
              className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-navy-soft"
            />
            <div className="relative">
              <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/55">
                Total Balance
              </p>
              <p className="mt-1 text-[22px] font-bold leading-7 text-white">
                1,284.50
                <span className="ml-1 text-[11px] font-semibold text-gold">MON</span>
              </p>
              <div className="mt-3 flex gap-1.5">
                <span className="flex-1 rounded-lg bg-white py-1.5 text-center text-[9px] font-semibold text-navy">
                  Send
                </span>
                <span className="flex-1 rounded-lg border border-white/25 bg-white/10 py-1.5 text-center text-[9px] font-semibold text-white">
                  Receive
                </span>
              </div>
            </div>
          </div>

          {/* Mini apps */}
          <div className="flex gap-2 px-3 py-3">
            {[
              { label: 'Swap', tint: 'bg-[#E4DFFF]' },
              { label: 'Airdrop', tint: 'bg-[#EDE7FF]' },
              { label: 'Dice', tint: 'bg-[#F1EEFF]' },
              { label: 'Food', tint: 'bg-[#FBE9F3]' },
            ].map((app) => (
              <div key={app.label} className="flex flex-1 flex-col items-center gap-1">
                <div className={`h-8 w-8 rounded-xl ${app.tint}`} />
                <span className="text-[8px] font-medium text-black/50">{app.label}</span>
              </div>
            ))}
          </div>

          {/* Feed heading */}
          <div className="flex items-center justify-between px-4 pt-1">
            <span className="text-[11px] font-bold text-[#0e100f]">What&apos;s happening?</span>
            <span className="rounded-full border border-black/10 px-2 py-0.5 text-[8px] font-semibold text-black/60">
              Explore
            </span>
          </div>

          {/* Posts */}
          <div className="space-y-2 px-3 py-2.5">
            <PostCard />
            <PostCard />
          </div>

          {/* Tab bar */}
          <div className="flex items-center justify-between border-t border-black/[0.07] bg-white px-3 pb-4 pt-2">
            {NAV.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={`flex h-6 w-10 items-center justify-center rounded-full ${
                    item.active ? 'bg-gold' : ''
                  }`}
                >
                  <item.icon
                    className={`h-3.5 w-3.5 ${item.active ? 'text-navy' : 'text-black/35'}`}
                  />
                </span>
                <span
                  className={`text-[7.5px] ${
                    item.active ? 'font-bold text-navy' : 'font-medium text-black/40'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating stat cards */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-6 top-16 hidden rounded-2xl border border-white/15 bg-navy/90 px-3.5 py-2.5 shadow-lift backdrop-blur sm:block"
      >
        <p className="text-[10px] text-white/60">Tips earned</p>
        <p className="text-sm font-bold text-gold">+2.5 MON</p>
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -right-7 bottom-24 hidden rounded-2xl border border-white/15 bg-navy/90 px-3.5 py-2.5 shadow-lift backdrop-blur sm:block"
      >
        <p className="text-[10px] text-white/60">Settlement</p>
        <p className="text-sm font-bold text-white">&lt; 1 second</p>
      </motion.div>
    </motion.div>
  )
}
