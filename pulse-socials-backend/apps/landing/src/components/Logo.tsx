import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
  /** Renders the wordmark next to the mark. */
  withWordmark?: boolean
}

export default function Logo({ size = 40, className = '', withWordmark = false }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-navy ring-1 ring-inset ring-white/15"
        style={{ width: size, height: size }}
      >
        {/* Brand gradient edge */}
        <span
          aria-hidden
          className="absolute inset-0 opacity-90"
          style={{
            background: 'linear-gradient(135deg, #6e54ff 0%, #b8b4fe 52%, #a0055d 100%)',
          }}
        />
        <span className="absolute inset-[3px] overflow-hidden rounded-[13px] bg-navy-deep">
          <Image
            src="/appicon.png"
            alt=""
            width={Math.round(size * 0.72)}
            height={Math.round(size * 0.72)}
            priority
            className="h-full w-full object-contain"
          />
        </span>
      </span>

      {withWordmark && (
        <span className="text-lg font-bold tracking-tight text-white">Pulse</span>
      )}
    </span>
  )
}
