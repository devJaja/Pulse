import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

// Monad brand display typeface (Britti Sans), used for headings.
const britti = localFont({
  src: [
    { path: '../../public/fonts/BrittiSans_400Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/BrittiSans_500Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/BrittiSans_600SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/BrittiSans_700Bold.ttf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/BrittiSans_800ExtraBold.ttf', weight: '800', style: 'normal' },
  ],
  variable: '--font-britti',
  display: 'swap',
})

const description =
  'Own your content. Own your earnings. Pulse is social media on Monad where every post becomes an asset you own — tips, token trading and zero platform fees.'

export const metadata: Metadata = {
  metadataBase: new URL('https://pulse.social'),
  title: {
    default: 'Pulse — Social Media on Monad',
    template: '%s · Pulse',
  },
  description,
  applicationName: 'Pulse',
  keywords: [
    'monad',
    'social media',
    'web3',
    'blockchain',
    'crypto',
    'defi',
    'socialfi',
    'creator tokens',
  ],
  authors: [{ name: 'Pulse' }],
  openGraph: {
    type: 'website',
    title: 'Pulse — Social Media on Monad',
    description,
    siteName: 'Pulse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse — Social Media on Monad',
    description,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0e100f',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${britti.variable}`}>
      <body className="min-h-screen bg-navy-deep font-sans text-white antialiased">
        {children}
      </body>
    </html>
  )
}
