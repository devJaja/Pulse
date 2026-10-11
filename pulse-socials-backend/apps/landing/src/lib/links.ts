export const WEB_URL =
  process.env.NEXT_PUBLIC_WEB_URL || 'https://pulse-socials.vercel.app'

// Direct artifact link: EAS build pages sit behind the account console and
// signed artifact URLs expire, so prefer a Vercel env var once one is set.
export const APK_URL =
  process.env.NEXT_PUBLIC_APK_URL ||
  'https://expo.dev/artifacts/eas/0BBF4LyT28P_GDXwACOtHzN-hyeo8KPyfjIWAQniWWg.apk'

export const CONTACT_EMAIL = 'team@pulse.social'

export function externalProps(href: string) {
  const isMailto = href.startsWith('mailto:')
  return isMailto
    ? {}
    : { target: '_blank' as const, rel: 'noreferrer' as const }
}
