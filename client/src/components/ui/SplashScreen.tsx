/**
 * SplashScreen.tsx — App launch screen
 *
 * Shown for ~2 seconds when the app first loads, just like a native
 * mobile app. Displays the ClearSpend logo and tagline on a teal
 * background, then fades out smoothly.
 *
 * The parent (App.tsx) passes an `onDone` callback that is called
 * once the fade-out finishes, at which point the splash is removed
 * from the DOM entirely.
 */

import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'

interface SplashScreenProps {
  onDone: () => void   // called when the fade-out animation finishes
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  // Controls whether we're in the fade-out phase
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // After 1.8s: start fading out
    const fadeTimer = setTimeout(() => setFading(true), 1800)
    // After 2.3s: tell the parent we're done (0.5s fade duration)
    const doneTimer = setTimeout(() => onDone(), 2300)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-primary-500 transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Logo icon — bounces in via CSS animation defined in index.css */}
      <div className="splash-logo mb-6">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
          <Wallet className="w-13 h-13 text-white" strokeWidth={1.5} />
        </div>
      </div>

      {/* App name — fades up with a slight delay */}
      <h1 className="splash-title text-4xl font-bold text-white tracking-tight">
        ClearSpend
      </h1>

      {/* Tagline — fades up after the title */}
      <p className="splash-tagline text-white/70 text-base mt-2">
        Track smarter. Spend better.
      </p>

      {/* Loading dots at the bottom — so it feels like something is happening */}
      <div className="absolute bottom-16 flex items-center gap-1.5">
        <span className="splash-dot w-1.5 h-1.5 rounded-full bg-white/50" style={{ animationDelay: '0ms' }} />
        <span className="splash-dot w-1.5 h-1.5 rounded-full bg-white/50" style={{ animationDelay: '200ms' }} />
        <span className="splash-dot w-1.5 h-1.5 rounded-full bg-white/50" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  )
}
