'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'

// ── SVG bird that flaps ─────────────────────────────────────────────────────
function Bird({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" fill="currentColor">
      <path d="M30 15 Q20 5 5 8 Q15 12 30 15 Q45 12 55 8 Q40 5 30 15Z" />
    </svg>
  )
}

// ── Walking person silhouette ───────────────────────────────────────────────
function Person({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 48"
      fill="currentColor"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      {/* head */}
      <circle cx="12" cy="5" r="4.5" />
      {/* body */}
      <rect x="9" y="10" width="6" height="14" rx="2" />
      {/* left leg */}
      <rect x="8" y="24" width="3.5" height="14" rx="1.5" className="origin-top animate-leg-l" />
      {/* right leg */}
      <rect x="12.5" y="24" width="3.5" height="14" rx="1.5" className="origin-top animate-leg-r" />
      {/* left arm */}
      <rect x="4" y="11" width="5" height="3" rx="1.5" className="origin-right" />
      {/* right arm */}
      <rect x="15" y="11" width="5" height="3" rx="1.5" className="origin-left" />
    </svg>
  )
}

// ── Dog silhouette ──────────────────────────────────────────────────────────
function Dog({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 32" fill="currentColor">
      <ellipse cx="30" cy="20" rx="18" ry="8" />
      <rect x="12" y="22" width="4" height="10" rx="2" />
      <rect x="20" y="24" width="4" height="8" rx="2" />
      <rect x="34" y="24" width="4" height="8" rx="2" />
      <rect x="42" y="22" width="4" height="10" rx="2" />
      <ellipse cx="48" cy="15" rx="8" ry="7" />
      <ellipse cx="53" cy="10" rx="3" ry="5" style={{ transform: 'rotate(20deg)', transformOrigin: '53px 10px' }} />
      <ellipse cx="43" cy="10" rx="3" ry="5" style={{ transform: 'rotate(-20deg)', transformOrigin: '43px 10px' }} />
      <path d="M56 18 Q60 15 62 18" strokeWidth="2" stroke="currentColor" fill="none" />
    </svg>
  )
}

// ── Tree silhouette ─────────────────────────────────────────────────────────
function Tree({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 90" fill="currentColor">
      <rect x="21" y="55" width="8" height="35" rx="3" />
      <ellipse cx="25" cy="40" rx="20" ry="28" />
      <ellipse cx="16" cy="52" rx="13" ry="18" />
      <ellipse cx="34" cy="52" rx="13" ry="18" />
    </svg>
  )
}

// ── Main apartment building facade ──────────────────────────────────────────
function BuildingFacade({ windowGlow }: { windowGlow: number }) {
  // windowGlow 0→1 as user scrolls (lights up the zoom-target window)
  const windows = [
    // row, col grid of windows [x, y, isTarget]
    [80, 60, false], [130, 60, false], [180, 60, false], [230, 60, false], [280, 60, false],
    [80, 110, false], [130, 110, false], [180, 110, true], [230, 110, false], [280, 110, false],
    [80, 160, false], [130, 160, false], [180, 160, false], [230, 160, false], [280, 160, false],
    [80, 210, false], [130, 210, false], [180, 210, false], [230, 210, false], [280, 210, false],
  ] as [number, number, boolean][]

  return (
    <svg viewBox="0 0 380 340" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Building body */}
      <rect x="40" y="30" width="300" height="300" rx="4" fill="#e8ddd0" />
      {/* Facade texture stripes */}
      {[60, 90, 120, 150, 180, 210, 240, 270, 300].map((y) => (
        <line key={y} x1="40" y1={y} x2="340" y2={y} stroke="#d4c9bb" strokeWidth="0.5" />
      ))}
      {/* Roof detail */}
      <rect x="30" y="18" width="320" height="16" rx="4" fill="#c9b99a" />
      <rect x="50" y="8" width="280" height="14" rx="4" fill="#bfab8e" />
      {/* Water tank */}
      <rect x="150" y="-2" width="80" height="14" rx="4" fill="#a89478" />

      {/* Windows */}
      {windows.map(([x, y, isTarget], i) => {
        const lit = isTarget
          ? `rgba(255, ${200 + windowGlow * 55}, ${100 + windowGlow * 100}, ${0.4 + windowGlow * 0.6})`
          : i % 3 === 0 ? '#f5e9c8' : i % 5 === 0 ? '#c8dff5' : '#fff'
        return (
          <g key={i}>
            <rect x={x - 18} y={y - 22} width="36" height="44" rx="3" fill={isTarget ? lit : '#b8cce0'} />
            <rect x={x - 14} y={y - 18} width="28" height="36" rx="2" fill={lit} />
            {/* Window frame cross */}
            <line x1={x} y1={y - 18} x2={x} y2={y + 18} stroke="#9ab2c8" strokeWidth="1" />
            <line x1={x - 14} y1={y} x2={x + 14} y2={y} stroke="#9ab2c8" strokeWidth="1" />
            {isTarget && windowGlow > 0.3 && (
              <rect
                x={x - 18} y={y - 22} width="36" height="44" rx="3"
                fill={`rgba(255, 220, 120, ${(windowGlow - 0.3) * 0.4})`}
              />
            )}
          </g>
        )
      })}

      {/* Balconies */}
      {[80, 130, 230, 280].map((x) => (
        <g key={x}>
          <rect x={x - 22} y={240} width="44" height="8" rx="2" fill="#c9b99a" />
          <rect x={x - 22} y={248} width="3" height="12" rx="1" fill="#b8a888" />
          <rect x={x + 19} y={248} width="3" height="12" rx="1" fill="#b8a888" />
          <rect x={x - 22} y={258} width="44" height="3" rx="1" fill="#c9b99a" />
        </g>
      ))}

      {/* Ground floor entrance */}
      <rect x="155" y="285" width="70" height="45" rx="4" fill="#a89478" />
      <rect x="163" y="290" width="25" height="35" rx="2" fill="#8b7355" />
      <rect x="192" y="290" width="25" height="35" rx="2" fill="#8b7355" />
      <rect x="140" y="310" width="100" height="8" rx="2" fill="#c9b99a" />
    </svg>
  )
}

export function CinematicHero() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  // Zoom into the building window
  const rawScale = useTransform(scrollYProgress, [0, 0.6], [1, 5])
  const scale = useSpring(rawScale, { stiffness: 80, damping: 20 })

  // Shift view upward to center on the target window (2nd row, 3rd col)
  const rawY = useTransform(scrollYProgress, [0, 0.6], ['0%', '-18%'])
  const y = useSpring(rawY, { stiffness: 80, damping: 20 })

  // Slight left shift to center on window
  const rawX = useTransform(scrollYProgress, [0, 0.6], ['0%', '-2%'])
  const x = useSpring(rawX, { stiffness: 80, damping: 20 })

  // Fade out sky/foreground as we zoom in
  const overlayOpacity = useTransform(scrollYProgress, [0.4, 0.7], [0, 1])

  // Window glow increases on scroll
  const windowGlowMV = useTransform(scrollYProgress, [0.2, 0.6], [0, 1])
  const [windowGlow, setWindowGlow] = useState(0)
  useMotionValueEvent(windowGlowMV, 'change', setWindowGlow)

  // Scroll indicator fades out
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])

  // Page content fades in after zoom
  const contentOpacity = useTransform(scrollYProgress, [0.65, 0.85], [0, 1])
  const contentY = useTransform(scrollYProgress, [0.65, 0.85], [40, 0])

  return (
    <>
      {/* ── Scroll container (5× viewport height gives scroll space) ── */}
      <div ref={containerRef} className="relative h-[500vh]">
        {/* ── Sticky scene ── */}
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* ── Zoomable scene wrapper ── */}
          <motion.div
            style={{ scale, x, y }}
            className="absolute inset-0 origin-center"
          >
            {/* Sky gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100" />

            {/* Sun */}
            <div className="absolute top-[8%] right-[15%] w-20 h-20 rounded-full bg-yellow-300 shadow-[0_0_60px_20px_rgba(253,224,71,0.5)]" />

            {/* Distant city silhouette */}
            <svg className="absolute bottom-[28%] w-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
              <path
                d="M0 200 L0 140 L60 140 L60 100 L80 100 L80 80 L100 80 L100 60 L120 60 L120 80 L160 80 L160 50 L190 50 L190 80 L220 80 L220 30 L240 30 L240 80 L280 80 L280 100 L320 100 L320 60 L350 60 L350 40 L370 40 L370 60 L400 60 L400 100 L440 100 L440 120 L480 120 L480 70 L510 70 L510 40 L530 40 L530 70 L570 70 L570 100 L610 100 L610 60 L640 60 L640 80 L680 80 L680 50 L700 50 L700 30 L720 30 L720 50 L760 50 L760 80 L800 80 L800 110 L840 110 L840 70 L870 70 L870 40 L890 40 L890 70 L930 70 L930 100 L960 100 L960 50 L990 50 L990 80 L1020 80 L1020 110 L1060 110 L1060 80 L1090 80 L1090 50 L1120 50 L1120 80 L1160 80 L1160 100 L1200 100 L1200 70 L1230 70 L1230 40 L1260 40 L1260 70 L1300 70 L1300 100 L1340 100 L1340 120 L1380 120 L1380 140 L1440 140 L1440 200Z"
                fill="#c8d8e8"
              />
            </svg>

            {/* ── Flying birds ── */}
            <div className="absolute top-[12%] left-0 w-full overflow-hidden pointer-events-none">
              {[
                { top: '10%', delay: '0s', duration: '14s', size: 28 },
                { top: '22%', delay: '3s', duration: '18s', size: 22 },
                { top: '6%', delay: '6s', duration: '12s', size: 18 },
                { top: '30%', delay: '1.5s', duration: '20s', size: 24 },
                { top: '15%', delay: '8s', duration: '16s', size: 20 },
                { top: '35%', delay: '4s', duration: '22s', size: 16 },
              ].map((b, i) => (
                <div
                  key={i}
                  className="absolute text-gray-500/60"
                  style={{
                    top: b.top,
                    animation: `flyBird ${b.duration} ${b.delay} linear infinite`,
                    width: b.size,
                    height: b.size / 2,
                  }}
                >
                  <Bird className="w-full h-full" />
                </div>
              ))}
            </div>

            {/* ── Trees on either side ── */}
            <div className="absolute bottom-[22%] left-[3%] flex gap-4 items-end pointer-events-none">
              <Tree className="w-12 h-24 text-green-700/80" />
              <Tree className="w-10 h-20 text-green-800/70" />
            </div>
            <div className="absolute bottom-[22%] right-[3%] flex gap-4 items-end pointer-events-none">
              <Tree className="w-10 h-20 text-green-800/70" />
              <Tree className="w-12 h-24 text-green-700/80" />
            </div>

            {/* ── Main building ── */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[18%] w-[42vw] max-w-md h-[55vh]">
              <BuildingFacade windowGlow={windowGlow} />
            </div>

            {/* ── Ground / road ── */}
            <div className="absolute bottom-0 left-0 right-0 h-[22%] bg-gradient-to-t from-stone-400 to-stone-300" />
            {/* Road */}
            <div className="absolute bottom-[4%] left-0 right-0 h-[10%] bg-stone-500/60" />
            {/* Road markings */}
            <div className="absolute bottom-[8%] left-0 right-0 flex justify-center gap-12">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-16 h-1.5 bg-white/70 rounded" />
              ))}
            </div>

            {/* ── Walking people ── */}
            {/* Person 1: walks right */}
            <div
              className="absolute bottom-[17%] text-stone-700/75"
              style={{ animation: 'walkRight 18s 0s linear infinite', width: 20, height: 40 }}
            >
              <Person className="w-full h-full" />
            </div>
            {/* Person 2 with dog: walks right, offset */}
            <div
              className="absolute bottom-[17%] flex items-end gap-1 text-stone-600/70"
              style={{ animation: 'walkRight 24s 5s linear infinite', width: 44, height: 40 }}
            >
              <Person className="w-5 h-10" />
              <Dog className="w-10 h-6 mb-1" />
            </div>
            {/* Person 3: walks left */}
            <div
              className="absolute bottom-[17%] text-stone-700/65"
              style={{ animation: 'walkLeft 20s 2s linear infinite', width: 18, height: 36 }}
            >
              <Person className="w-full h-full" flip />
            </div>
            {/* Person 4: walks left, faster */}
            <div
              className="absolute bottom-[17%] text-stone-600/60"
              style={{ animation: 'walkLeft 14s 8s linear infinite', width: 16, height: 32 }}
            >
              <Person className="w-full h-full" flip />
            </div>
          </motion.div>

          {/* ── Dark overlay that covers scene during zoom-in ── */}
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-gray-900 pointer-events-none"
          />

          {/* ── Scroll hint ── */}
          <motion.div
            style={{ opacity: scrollHintOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/80 z-20 pointer-events-none"
          >
            <span className="text-sm font-medium tracking-widest uppercase">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            >
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Page content revealed after zoom ── */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 bg-white"
        >
          <HeroContent />
        </motion.div>
      </div>

      {/* Inline keyframes for CSS animations */}
      <style>{`
        @keyframes flyBird {
          0%   { transform: translateX(-80px) translateY(0px); }
          25%  { transform: translateX(25vw) translateY(-20px); }
          50%  { transform: translateX(50vw) translateY(5px); }
          75%  { transform: translateX(75vw) translateY(-10px); }
          100% { transform: translateX(110vw) translateY(0px); }
        }
        @keyframes walkRight {
          0%   { left: -40px; }
          100% { left: 110%; }
        }
        @keyframes walkLeft {
          0%   { left: 110%; }
          100% { left: -40px; }
        }
        @keyframes animate-leg-l {
          0%, 100% { transform: rotate(20deg); }
          50%       { transform: rotate(-20deg); }
        }
        @keyframes animate-leg-r {
          0%, 100% { transform: rotate(-20deg); }
          50%       { transform: rotate(20deg); }
        }
      `}</style>
    </>
  )
}

// ── Hero content shown after the zoom ───────────────────────────────────────
function HeroContent() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col items-center justify-center text-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-500/30 rounded-full px-4 py-1.5 mb-6">
          <span className="text-brand-400 text-sm font-medium">🏠 Bangalore's #1 Housing Platform</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Find Your{' '}
          <span className="text-brand-400">Perfect Space</span>
          {' '}in Bangalore
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
          Browse PGs, apartments, and shared flats across Koramangala, HSR, Indiranagar, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            <Search className="h-5 w-5" />
            Explore Listings
          </Link>
          <Link
            href="/share-space"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
          >
            Share Your Space
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
