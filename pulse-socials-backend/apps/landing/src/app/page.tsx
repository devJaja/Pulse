'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Coins,
  Cpu,
  Dice5,
  Gamepad2,
  Gift,
  Globe,
  Lock,
  MessageCircle,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import AppPreview from '@/components/AppPreview'
import Logo from '@/components/Logo'
import SiteHeader from '@/components/SiteHeader'
import WaitlistForm from '@/components/WaitlistForm'
import DownloadSuggestion from '@/components/DownloadSuggestion'
import { APK_URL, CONTACT_EMAIL, WEB_URL, externalProps } from '@/lib/links'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const viewport = { once: true, margin: '-80px' }

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  accent: string
  tint: string
}

const features: Feature[] = [
  {
    icon: Coins,
    title: 'Tokenized posts',
    description:
      'Every post you publish becomes a tradeable asset. Your content holds intrinsic value that grows with your audience.',
    accent: 'from-navy to-teal',
    tint: 'text-teal-soft',
  },
  {
    icon: Zap,
    title: 'Settles in seconds',
    description:
      'Powered by Monad. Sub-second finality and effectively zero fees — Web3 without the wait or the gas wars.',
    accent: 'from-gold to-gold-deep',
    tint: 'text-gold',
  },
  {
    icon: Shield,
    title: 'You own the account',
    description:
      'Self-custodial wallet, on-chain content, no platform takedowns. Nobody can ban you or freeze your earnings.',
    accent: 'from-teal to-navy',
    tint: 'text-lilac-soft',
  },
  {
    icon: MessageCircle,
    title: 'Social with a payout',
    description:
      'Follow creators, tip the posts you love and message them directly — engagement that turns into real income.',
    accent: 'from-lilac to-teal',
    tint: 'text-lilac-soft',
  },
  {
    icon: TrendingUp,
    title: 'Creator upside',
    description:
      'Back the creators you believe in before they break out. When they grow, so does the value of what you hold.',
    accent: 'from-navy to-lilac',
    tint: 'text-gold-soft',
  },
  {
    icon: Users,
    title: 'Reach without rent',
    description:
      'No algorithm deciding who sees your work. Organic distribution, real engagement, zero pay-to-play.',
    accent: 'from-gold to-teal',
    tint: 'text-gold',
  },
]

const miniApps: { icon: LucideIcon; name: string; desc: string; tint: string }[] = [
  {
    icon: Coins,
    name: 'Token Swap',
    desc: 'Swap MON for any token at live DexScreener rates.',
    tint: 'text-teal-soft',
  },
  {
    icon: Gift,
    name: 'Daily Airdrop',
    desc: 'Claim a free MON drop every 24 hours, no strings.',
    tint: 'text-gold',
  },
  {
    icon: Dice5,
    name: 'Dice',
    desc: 'Roll against the house and cash out instantly.',
    tint: 'text-lilac-soft',
  },
  {
    icon: Gamepad2,
    name: 'Lucky Spin',
    desc: 'One spin, multipliers up to 5x on your stake.',
    tint: 'text-gold-soft',
  },
  {
    icon: BarChart3,
    name: 'Portfolio',
    desc: 'Track holdings and earnings in real time.',
    tint: 'text-teal-soft',
  },
  {
    icon: MessageCircle,
    name: 'Crypto Chat',
    desc: 'Message anyone and send a tip in the same thread.',
    tint: 'text-lilac-soft',
  },
]

const steps = [
  {
    title: 'Create your wallet',
    desc: 'Sign up and a self-custodial Monad wallet is generated for you. No seed phrase gymnastics, no bank.',
    icon: Wallet,
  },
  {
    title: 'Post and publish',
    desc: 'Share text, photos and video. Optionally tokenize the post so your audience can back it.',
    icon: Sparkles,
  },
  {
    title: 'Earn in MON',
    desc: 'Tips, token trades and engagement land straight in your wallet. Pulse takes zero percent.',
    icon: TrendingUp,
  },
]

const stats = [
  { value: '$0', label: 'Platform fees', icon: Wallet },
  { value: '<1s', label: 'Settlement', icon: Zap },
  { value: '100%', label: 'Self-custody', icon: Lock },
  { value: '24/7', label: 'Always on', icon: Globe },
  { value: '100k+', label: 'TPS capacity', icon: Cpu },
  { value: '0', label: 'Censorship risk', icon: Shield },
]

const highlights = [
  'Create and share posts, photos and video',
  'Follow creators and build a real network',
  'Like, comment and tip in one tap',
  'Buy and sell creator tokens',
  'Send instant peer-to-peer payments',
  'Play games and win MON rewards',
  'Order food and pay with crypto',
  'Track portfolio value in real time',
]

const footerGroups = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Mini Apps', href: '#mini-apps' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Open the app', href: WEB_URL },
    ],
  },
  {
    title: 'Build',
    links: [
      { label: 'Open the web app', href: WEB_URL },
      { label: 'Download for Android', href: APK_URL },
      { label: 'Monad network', href: 'https://monad.xyz' },
      { label: 'Join the waitlist', href: '#download' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'X / Twitter', href: 'https://x.com' },
      { label: 'Discord', href: 'https://discord.com' },
      { label: 'Telegram', href: 'https://telegram.org' },
      { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
]

export default function Home() {
  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid mask-radial-fade" />
        <div
          className="absolute -left-40 -top-40 h-[38rem] w-[38rem] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(0,168,181,0.20), transparent 65%)' }}
        />
        <div
          className="absolute -right-32 top-24 h-[34rem] w-[34rem] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(253,219,36,0.16), transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(183,172,232,0.12), transparent 65%)' }}
        />
      </div>

      <SiteHeader />

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="relative overflow-hidden pt-32 sm:pt-40">
          <div className="container-page">
            <div className="grid items-center gap-16 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:pb-28">
              {/* Copy */}
              <div className="max-w-2xl">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  transition={{ duration: 0.6 }}
                  className="eyebrow"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  Built on Monad
                </motion.div>

                <motion.h1
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  transition={{ duration: 0.7, delay: 0.06 }}
                  className="heading-xl mt-6 text-balance"
                >
                  Social media that{' '}
                  <span className="gradient-text-gold animate-shimmer">actually pays you</span>
                </motion.h1>

                <motion.p
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  transition={{ duration: 0.7, delay: 0.14 }}
                  className="lede mt-6 max-w-xl text-pretty"
                >
                  Pulse turns every post into an asset you own. Post, get tipped, and let your
                  audience back you — all settled on Monad in under a second, with zero platform
                  fees.
                </motion.p>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  transition={{ duration: 0.7, delay: 0.22 }}
                  className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <a href={WEB_URL} target="_blank" rel="noreferrer" className="btn-primary btn-lg">
                    Open the app
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <a href="#features" className="btn-ghost btn-lg">
                    See how it works
                  </a>
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="mt-9 flex flex-wrap gap-2"
                >
                  <span className="chip">
                    <BadgeCheck className="h-4 w-4 text-gold" />
                    Self-custodial
                  </span>
                  <span className="chip">
                    <Zap className="h-4 w-4 text-gold" />
                    Sub-second finality
                  </span>
                  <span className="chip">
                    <Shield className="h-4 w-4 text-gold" />
                    Zero censorship
                  </span>
                </motion.div>
              </div>

              {/* Product shot */}
              <div className="lg:pl-6">
                <AppPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Stats ---------------- */}
        <section className="hairline border-y">
          <div className="container-page">
            <dl className="grid grid-cols-2 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-2 px-2 text-center">
                  <stat.icon className="h-5 w-5 text-gold" />
                  <dt className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {stat.value}
                  </dt>
                  <dd className="text-xs text-white/45">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="anchor-offset py-24 sm:py-32">
          <div className="container-page">
            <SectionHeading
              eyebrow="Why Pulse"
              title="Everything a social app forgot to give you"
              description="Followers, likes and reach are rented. On Pulse, your audience, your content and your earnings are yours to keep."
            />

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.article
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport}
                  variants={fadeUp}
                  transition={{ duration: 0.55 }}
                  className="surface surface-hover group flex flex-col p-6 sm:p-7"
                >
                  <span
                    className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent}`}
                  >
                    <feature.icon className="h-5 w-5 text-white" />
                  </span>
                  <h3 className="heading-md text-lg text-white">{feature.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/55">
                    {feature.description}
                  </p>
                  <span className="mt-auto pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-white/0 transition group-hover:text-white/25">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Mini apps ---------------- */}
        <section id="mini-apps" className="anchor-offset hairline border-y py-24 sm:py-32">
          <div className="container-page">
            <SectionHeading
              eyebrow="Mini Apps"
              title="An app suite, not a single app"
              description="Six mini-apps ship inside Pulse on day one — trading, games and rewards, all funded from the same wallet."
            />

            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {miniApps.map((app) => (
                <motion.div
                  key={app.name}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="surface surface-hover group flex items-start gap-4 p-5 sm:p-6"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] ${app.tint}`}
                  >
                    <app.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white">{app.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/50">{app.desc}</p>
                    <span className="mt-3 inline-flex rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold">
                      Live
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section id="how-it-works" className="anchor-offset py-24 sm:py-32">
          <div className="container-page">
            <SectionHeading
              eyebrow="How it works"
              title="Three steps to getting paid"
              description="No seed phrase to back up, no exchange to sign up for, no approval process."
            />

            <ol className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-10">
              {steps.map((step, index) => (
                <motion.li
                  key={step.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport}
                  variants={fadeUp}
                  transition={{ duration: 0.55, delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-bold text-gold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="heading-md text-lg text-white">{step.title}</h3>
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-white/55 lg:pl-[60px]">
                    {step.desc}
                  </p>
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[22px] top-14 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-white/15 to-transparent lg:block"
                    />
                  )}
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------- Showcase ---------------- */}
        <section className="hairline border-y py-24 sm:py-32">
          <div className="container-page">
            <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={fadeUp}
                transition={{ duration: 0.6 }}
              >
                <p className="eyebrow">One app</p>
                <h2 className="heading-lg mt-5 text-balance">
                  Your feed, your wallet and your games in one place
                </h2>
                <p className="lede mt-5 max-w-lg text-pretty">
                  No app switching. Everything you need to post, get paid and have fun lives in a
                  single 12&nbsp;MB build.
                </p>

                <ul className="mt-9 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" />
                      <span className="text-[15px] leading-snug text-white/65">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-wrap gap-3">
                  <a href={WEB_URL} target="_blank" rel="noreferrer" className="btn-primary">
                    Open the app
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href={APK_URL} target="_blank" rel="noreferrer" className="btn-ghost">
                    <Logo size={20} />
                    Get the Android build
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-4xl border border-white/10 bg-white/[0.03] p-8 sm:p-12"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Inside the app
                </p>
                <dl className="mt-8 space-y-7">
                  {[
                    ['Tokenized post', '128 tokens @ 0.25 MON'],
                    ['Tips this week', '14.20 MON'],
                    ['Portfolio value', '1,284.50 MON'],
                    ['Network settlement', '< 1 second'],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] pb-4 last:border-0 last:pb-0"
                    >
                      <dt className="text-sm text-white/45">{label}</dt>
                      <dd className="text-right text-sm font-semibold text-white">{value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section id="download" className="anchor-offset py-24 sm:py-32">
          <div className="container-page">
            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-navy px-6 py-16 text-center sm:px-12 sm:py-20">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(70% 100% at 50% 0%, rgba(253,219,36,0.16) 0%, transparent 65%)',
                }}
              />
              <div className="relative mx-auto max-w-2xl">
                <Logo size={56} className="mb-8 justify-center" />
                <h2 className="heading-lg text-balance">
                  Own your audience. Own your earnings.
                </h2>
                <p className="lede mt-5 text-pretty">
                  Pulse is free to join, takes zero percent of what you earn, and works on web and
                  Android today.
                </p>

                <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <a href={WEB_URL} target="_blank" rel="noreferrer" className="btn-primary btn-lg">
                    Open the app
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <a href={APK_URL} target="_blank" rel="noreferrer" className="btn-ghost btn-lg">
                    Download for Android
                  </a>
                </div>

                <div className="mx-auto mt-12 max-w-md">
                  <WaitlistForm compact />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="hairline border-t">
        <div className="container-page py-16">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
            <div className="max-w-sm">
              <Logo size={40} withWordmark />
              <p className="mt-5 text-sm leading-relaxed text-white/45">
                Social media on Monad, where the content you create and the money you earn belong
                to you.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-3">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                    {group.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          {...externalProps(link.href)}
                          className="link-quiet text-sm"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.07] pt-8 sm:flex-row sm:items-center">
            <p className="text-xs text-white/35">
              © {new Date().getFullYear()} Pulse. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/35">
              <a href={`mailto:${CONTACT_EMAIL}`} className="link-quiet text-xs">
                Contact
              </a>
              <a href="https://monad.xyz" target="_blank" rel="noreferrer" className="link-quiet text-xs">
                Built on Monad
              </a>
              <a href={WEB_URL} target="_blank" rel="noreferrer" className="link-quiet text-xs">
                Open the app
              </a>
            </div>
          </div>
        </div>
      </footer>

      <DownloadSuggestion />
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeUp}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-2xl text-center"
    >
      <div className="flex justify-center">
        <p className="eyebrow">{eyebrow}</p>
      </div>
      <h2 className="heading-lg mt-5 text-balance">{title}</h2>
      <p className="lede mt-5 text-pretty">{description}</p>
    </motion.div>
  )
}
