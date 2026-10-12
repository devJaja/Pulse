# Pulse Landing Page

Next.js landing page with Framer Motion animations for Pulse.

## Features

- ⚡ Built with Next.js 14 and TypeScript
- 🎨 Styled with Tailwind CSS
- ✨ Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🎯 Waitlist functionality
- 🚀 Optimized for performance

## Getting Started

### Install Dependencies

```bash
cd apps/landing
pnpm install
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
apps/landing/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   └── components/
│       ├── Logo.tsx         # Animated logo component
│       └── WaitlistForm.tsx # Waitlist form with validation
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Customization

### Update API Endpoint

In `src/components/WaitlistForm.tsx`, replace the TODO comment with your actual API endpoint:

```typescript
const response = await axios.post('YOUR_API_URL/waitlist', { email })
```

### Modify Colors

Update the gradient colors in `tailwind.config.ts` and `globals.css`:

```typescript
colors: {
  primary: '#9333ea',  // Purple
  secondary: '#6366f1', // Blue
}
```

### Add Social Links

Update the footer links in `src/app/page.tsx` with your actual social media URLs.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `apps/landing`
4. Deploy

### Other Platforms

Build the project and deploy the `.next` folder:

```bash
pnpm build
```

## Environment Variables

Create a `.env.local` file:

```env
# Where the web app lives — "Get Started" buttons navigate here
NEXT_PUBLIC_WEB_URL=https://pulse-web-pi-two.vercel.app

# Android APK download URL (defaults to the current EAS build artifact)
NEXT_PUBLIC_APK_URL=https://expo.dev/artifacts/eas/0BBF4LyT28P_GDXwACOtHzN-hyeo8KPyfjIWAQniWWg.apk
```

- `NEXT_PUBLIC_WEB_URL` — target of the **Get Started** buttons (hero, nav, CTA
  section) and the iOS "continue on web" option in the download suggestion.
- `NEXT_PUBLIC_APK_URL` — the download hyperlink for the Android banner. It
  currently points at the EAS build artifact on expo.dev. Note: EAS build links
  can expire after ~30 days on the free tier — when that happens, generate a new
  build (or host the APK in `public/pulse.apk` and set the URL to `/pulse.apk`).

## Download suggestion

The landing shows a mobile-only popup (Android: "Download for Android" →
`NEXT_PUBLIC_APK_URL`; iOS: "Continue on the web" → `NEXT_PUBLIC_WEB_URL`) once
per device. The logic lives in `src/components/DownloadSuggestion.tsx`.

## Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Time to Interactive: < 2s

## License

Proprietary - See LICENSE file in root directory
