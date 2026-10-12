'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  ChevronRight,
  Dice5,
  Gift,
  Heart,
  Home,
  MessageCircle,
  MessagesSquare,
  PieChart,
  Search,
  Send,
  Sparkles,
  SquarePen,
  User,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

type ScreenId = 'home' | 'search' | 'wallet' | 'chats' | 'profile'

const TABS: { id: ScreenId; icon: LucideIcon; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'wallet', icon: Wallet, label: 'Wallet' },
  { id: 'chats', icon: MessagesSquare, label: 'Chats' },
  { id: 'profile', icon: User, label: 'Profile' },
]

const MINI_APPS: { label: string; icon: LucideIcon; tint: string }[] = [
  { label: 'Swap', icon: ArrowRightLeft, tint: 'text-[#5a3fe0]' },
  { label: 'Airdrop', icon: Gift, tint: 'text-[#a0055d]' },
  { label: 'Dice', icon: Dice5, tint: 'text-[#5a3fe0]' },
  { label: 'Spin', icon: Sparkles, tint: 'text-[#a0055d]' },
  { label: 'Food', icon: Utensils, tint: 'text-[#5a3fe0]' },
]

const TAGS = ['#Monad', '#Pulse', '#DeFi', '#Creators', '#Airdrop']

const CREATORS: { name: string; handle: string }[] = [
  { name: 'Ada Nwosu', handle: '@ada.pulse' },
  { name: 'Kwame Boateng', handle: '@kwame.eth' },
  { name: 'Lina Farouk', handle: '@linafar' },
]

const ASSETS: { symbol: string; amount: string; usd: string; dot: string }[] = [
  { symbol: 'MON', amount: '124.5000', usd: '$12.45', dot: '#6e54ff' },
  { symbol: 'USDC', amount: '42.1000', usd: '$42.10', dot: '#2775ca' },
  { symbol: 'wETH', amount: '0.0850', usd: '$0.27', dot: '#627eea' },
]

const CHATS: { name: string; unread: number }[] = [
  { name: 'Kwame', unread: 2 },
  { name: 'Lina', unread: 0 },
  { name: 'Monad Team', unread: 0 },
  { name: '0xSofia', unread: 1 },
]

function Avatar({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ background: 'linear-gradient(135deg,#6e54ff,#8270ff 45%,#5a3fe0)' }}
    />
  )
}

function Line({ className = 'bg-black/10' }: { className?: string }) {
  return <span aria-hidden className={`block rounded-full ${className}`} />
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pb-1 pt-3 text-[10px] font-semibold text-[#0e100f]">
      <span>9:41</span>
      <span className="h-1 w-16 rounded-full bg-black/15" />
      <span className="flex items-center gap-1 text-black/70">
        <span className="flex h-2.5 items-end gap-[1.5px]">
          <span className="h-1 w-[3px] rounded-sm bg-current" />
          <span className="h-1.5 w-[3px] rounded-sm bg-current" />
          <span className="h-2 w-[3px] rounded-sm bg-current" />
          <span className="h-2.5 w-[3px] rounded-sm bg-current" />
        </span>
        <span className="ml-0.5 h-2.5 w-5 rounded-[3px] border border-current p-[1.5px]">
          <span className="block h-full w-2/3 rounded-[1px] bg-current" />
        </span>
      </span>
    </div>
  )
}

function BalanceCard() {
  return (
    <div className="relative mx-3 overflow-hidden rounded-2xl bg-navy px-4 py-3.5">
      <span
        aria-hidden
        className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-navy-soft"
      />
      <div className="relative">
        <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/55">
          Total Balance
        </p>
        <p className="mt-1 text-[22px] font-bold leading-7 text-white">
          124.50
          <span className="ml-1 text-[11px] font-semibold text-gold">MON</span>
        </p>
        <p className="mt-0.5 text-[9px] text-white/45">≈ $12.45</p>
        <div className="mt-3 flex gap-1.5">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white py-1.5 text-[9px] font-semibold text-navy">
            <ArrowUpRight className="h-3 w-3" />
            Send
          </span>
          <span className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/25 bg-white/10 py-1.5 text-[9px] font-semibold text-white">
            <ArrowDownLeft className="h-3 w-3" />
            Receive
          </span>
        </div>
      </div>
    </div>
  )
}

function PostCard() {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-3.5 shadow-[0_1px_2px_rgba(14,16,15,0.04)]">
      <div className="flex items-center gap-2.5">
        <Avatar className="h-8 w-8" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Line className="h-2.5 w-20 bg-black/20" />
            <BadgeCheck className="h-3 w-3 text-gold" />
          </div>
          <Line className="mt-1.5 h-2 w-14 bg-black/10" />
        </div>
        <span className="text-[9px] font-semibold text-black/35">2m</span>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <Line className="h-2 w-full bg-black/10" />
        <Line className="h-2 w-4/5 bg-black/10" />
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-black/[0.06] pt-2.5 text-black/40">
        <span className="inline-flex items-center gap-1.5 text-[10px]">
          <Heart className="h-3.5 w-3.5" /> 128
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px]">
          <MessageCircle className="h-3.5 w-3.5" /> 24
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-1 text-[9px] font-semibold text-[#5a3fe0]">
          <Gift className="h-3 w-3" /> Tip
        </span>
      </div>
    </div>
  )
}

function FeedScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7" />
          <div>
            <p className="text-[8px] font-medium text-black/40">Welcome back</p>
            <p className="text-[11px] font-bold leading-tight text-[#0e100f]">gm, Ada</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10">
            <Bell className="h-3.5 w-3.5 text-black/60" />
          </span>
          <Avatar className="h-7 w-7" />
        </div>
      </div>

      <BalanceCard />

      <div className="flex gap-2 px-3 py-3">
        {MINI_APPS.map((app) => (
          <div key={app.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/[0.04]">
              <app.icon className={`h-4 w-4 ${app.tint}`} />
            </span>
            <span className="text-[7.5px] font-medium text-black/50">{app.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 pt-1">
        <span className="text-[11px] font-bold text-[#0e100f]">What&apos;s happening?</span>
        <span className="rounded-full border border-black/10 px-2 py-0.5 text-[8px] font-semibold text-black/60">
          Explore
        </span>
      </div>

      <div className="space-y-2 overflow-hidden px-3 py-2.5">
        <PostCard />
        <PostCard />
      </div>
    </div>
  )
}

function SearchScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-1 pt-3">
        <p className="text-[15px] font-bold text-[#0e100f]">Explore</p>
        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2">
          <Search className="h-3.5 w-3.5 text-black/40" />
          <span className="text-[10px] text-black/35">Search creators, posts, tokens</span>
        </div>
      </div>

      <div className="px-4 pt-2.5">
        <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-black/40">
          Trending
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gold/10 px-2.5 py-1 text-[9px] font-semibold text-[#5a3fe0]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="px-4 pt-4 text-[8px] font-semibold uppercase tracking-[0.16em] text-black/40">
        Creators to follow
      </p>
      <div className="mt-1.5 overflow-hidden">
        {CREATORS.map((creator) => (
          <div key={creator.handle} className="flex items-center gap-2.5 px-4 py-2">
            <Avatar className="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-bold text-[#0e100f]">{creator.name}</p>
              <p className="truncate text-[8.5px] text-black/40">{creator.handle}</p>
            </div>
            <span className="rounded-full bg-gold px-2.5 py-1 text-[9px] font-bold text-white">
              Follow
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WalletScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-2.5 pt-3">
        <p className="text-[15px] font-bold text-[#0e100f]">Wallet</p>
        <PieChart className="h-4 w-4 text-black/50" />
      </div>

      <div className="mx-3 rounded-2xl bg-navy px-4 py-4">
        <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/55">
          Total Balance
        </p>
        <p className="mt-1 text-[24px] font-bold leading-8 text-white">$12.45</p>
        <p className="text-[10px] font-semibold text-gold">124.5000 MON</p>
        <div className="mt-3 flex gap-1.5">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white py-1.5 text-[9px] font-semibold text-navy">
            <ArrowUpRight className="h-3 w-3" />
            Send
          </span>
          <span className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/25 bg-white/10 py-1.5 text-[9px] font-semibold text-white">
            <ArrowDownLeft className="h-3 w-3" />
            Receive
          </span>
        </div>
      </div>

      <p className="px-4 pb-1 pt-4 text-[8px] font-semibold uppercase tracking-[0.16em] text-black/40">
        Your Assets
      </p>
      <div className="overflow-hidden">
        {ASSETS.map((asset) => (
          <div key={asset.symbol} className="flex items-center gap-2.5 px-4 py-2.5">
            <span
              aria-hidden
              className="h-7 w-7 shrink-0 rounded-full"
              style={{ background: asset.dot }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#0e100f]">{asset.symbol}</p>
              <p className="text-[8.5px] text-black/40">{asset.usd}</p>
            </div>
            <span className="text-[10px] font-semibold text-[#0e100f]">{asset.amount}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto px-4 pb-3">
        <span className="flex items-center justify-center gap-1.5 rounded-xl bg-gold/10 py-2 text-[10px] font-semibold text-[#5a3fe0]">
          <Send className="h-3.5 w-3.5" />
          Send money to a friend
        </span>
      </div>
    </div>
  )
}

function ChatsScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <p className="text-[15px] font-bold text-[#0e100f]">Chats</p>
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10">
          <SquarePen className="h-3.5 w-3.5 text-black/60" />
        </span>
      </div>

      <div className="overflow-hidden">
        {CHATS.map((chat) => (
          <div key={chat.name} className="flex items-center gap-2.5 px-4 py-2.5">
            <Avatar className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[10.5px] font-bold text-[#0e100f]">{chat.name}</p>
                <span className="shrink-0 text-[8px] text-black/35">2m</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Line className="h-2 w-28 bg-black/10" />
                {chat.unread > 0 && (
                  <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[8px] font-bold text-white">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto px-4 pb-3">
        <span className="flex items-center justify-center gap-1.5 rounded-xl bg-gold/10 py-2 text-[10px] font-semibold text-[#5a3fe0]">
          <Gift className="h-3.5 w-3.5" />
          Tip in chat with a tap
        </span>
      </div>
    </div>
  )
}

function ProfileScreen() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative h-16 bg-gold-sheen">
        <span className="absolute -bottom-6 left-4">
          <span className="block rounded-full ring-4 ring-[#fbfaf9]">
            <Avatar className="h-14 w-14" />
          </span>
        </span>
      </div>

      <div className="mt-8 px-4">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] font-bold text-[#0e100f]">Ada Nwosu</p>
          <BadgeCheck className="h-3.5 w-3.5 text-gold" />
        </div>
        <p className="text-[9px] text-black/40">@ada.pulse</p>
        <p className="mt-1.5 text-[9.5px] leading-relaxed text-black/55">
          Building on Monad. Posts, tips and on-chain good vibes.
        </p>

        <div className="mt-3 flex gap-4 text-[9px] text-black/45">
          <span>
            <b className="text-[#0e100f]">128</b> posts
          </span>
          <span>
            <b className="text-[#0e100f]">4.2k</b> followers
          </span>
          <span>
            <b className="text-[#0e100f]">312</b> following
          </span>
        </div>
      </div>

      <div className="mx-3 mt-3 flex items-center justify-between rounded-2xl bg-navy px-4 py-3">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-white/55">
            Earnings
          </p>
          <p className="mt-0.5 text-[16px] font-bold text-white">
            42.80
            <span className="ml-1 text-[9px] font-semibold text-gold">MON</span>
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-white">
          Withdraw
          <ChevronRight className="h-3 w-3" />
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 px-3 pb-3">
        {['bg-[#E4DFFF]', 'bg-[#FBE9F3]', 'bg-[#EDE7FF]', 'bg-[#F1EEFF]', 'bg-[#E4DFFF]', 'bg-[#FBE9F3]'].map(
          (tint, index) => (
            <span key={index} className={`aspect-square rounded-xl ${tint}`} />
          ),
        )}
      </div>
    </div>
  )
}

function renderScreen(id: ScreenId) {
  switch (id) {
    case 'search':
      return <SearchScreen />
    case 'wallet':
      return <WalletScreen />
    case 'chats':
      return <ChatsScreen />
    case 'profile':
      return <ProfileScreen />
    case 'home':
    default:
      return <FeedScreen />
  }
}

export default function AppPreview() {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduceMotion || paused) return
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % TABS.length)
    }, 4200)
    return () => clearInterval(timer)
  }, [reduceMotion, paused])

  const screenTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }

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
        style={{
          background:
            'radial-gradient(60% 60% at 50% 40%, rgba(110,84,255,0.28), transparent 70%)',
        }}
      />

      {/* Device */}
      <div
        className="rounded-[2.75rem] border border-white/15 bg-navy-deep p-2 shadow-lift"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#fbfaf9] text-ink">
          <StatusBar />

          <div className="relative h-[600px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={TABS[active].id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={screenTransition}
                className="absolute inset-0"
                role="img"
                aria-label={`Pulse ${TABS[active].label} screen preview`}
              >
                {renderScreen(TABS[active].id)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Tab bar */}
          <nav
            aria-label="App preview screens"
            className="flex items-center justify-between border-t border-black/[0.07] bg-white px-2 pb-4 pt-2"
          >
            {TABS.map((tab, index) => {
              const isActive = index === active
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Show ${tab.label} screen`}
                  aria-pressed={isActive}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1"
                >
                  <span
                    className={`flex h-6 w-10 items-center justify-center rounded-full transition-colors duration-300 ${
                      isActive ? 'bg-gold' : ''
                    }`}
                  >
                    <tab.icon
                      className={`h-3.5 w-3.5 transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-black/35'
                      }`}
                    />
                  </span>
                  <span
                    className={`text-[7.5px] transition-colors duration-300 ${
                      isActive ? 'font-bold text-navy' : 'font-medium text-black/40'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Floating stat cards */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-6 top-24 hidden rounded-2xl border border-white/15 bg-navy/90 px-3.5 py-2.5 shadow-lift backdrop-blur sm:block"
      >
        <p className="text-[10px] text-white/60">Tips earned</p>
        <p className="text-sm font-bold text-gold">+2.5 MON</p>
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -right-7 bottom-28 hidden rounded-2xl border border-white/15 bg-navy/90 px-3.5 py-2.5 shadow-lift backdrop-blur sm:block"
      >
        <p className="text-[10px] text-white/60">Settlement</p>
        <p className="text-sm font-bold text-white">&lt; 1 second</p>
      </motion.div>
    </motion.div>
  )
}
