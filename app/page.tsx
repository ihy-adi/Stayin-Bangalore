'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Star, Shield, Users, ArrowRight, Sparkles, Tag } from 'lucide-react'
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { ListingCard } from '@/components/listings/ListingCard'
import { PreferenceFlow } from '@/components/onboarding/PreferenceFlow'
import { CinematicHero } from '@/components/hero/CinematicHero'
import type { PropertyCard } from '@/types'

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── Scroll-triggered section wrapper ────────────────────────────────────────

function FadeInSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(to / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= to) { setCount(to); clearInterval(timer) }
      else setCount(start)
    }, 30)
    return () => clearInterval(timer)
  }, [inView, to])

  return <span ref={ref}>{count}{suffix}</span>
}

// ─── Floating background blob ─────────────────────────────────────────────────

function Blob({ className }: { className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
      animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -15, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

const POPULAR_AREAS = [
  { name: 'Koramangala', emoji: '☕', desc: 'Vibrant startup hub' },
  { name: 'HSR Layout', emoji: '🏙️', desc: 'Planned & peaceful' },
  { name: 'Indiranagar', emoji: '🎨', desc: 'Trendy & lively' },
  { name: 'Whitefield', emoji: '💻', desc: 'IT corridor' },
  { name: 'Electronic City', emoji: '⚡', desc: 'Budget friendly' },
  { name: 'Marathahalli', emoji: '🚇', desc: 'Well connected' },
]

const PLACEHOLDERS = [
  'Search Koramangala PGs…',
  'Find flats in HSR Layout…',
  'Rooms near Whitefield IT Park…',
  'Studios in Indiranagar…',
]

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [featuredListings, setFeaturedListings] = useState<PropertyCard[]>([])
  const [showPreferenceFlow, setShowPreferenceFlow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0])
  const [placeholderIdx, setPlaceholderIdx] = useState(0)

  useEffect(() => {
    fetch('/api/listings?sortBy=newest')
      .then((r) => r.json())
      .then((data) => { setFeaturedListings(data.slice(0, 6)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Rotating placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setPlaceholder(PLACEHOLDERS[placeholderIdx])
  }, [placeholderIdx])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    window.location.href = query.trim() ? `/explore?q=${encodeURIComponent(query)}` : '/explore'
  }

  return (
    <>
      <AnimatePresence>
        {showPreferenceFlow && <PreferenceFlow onClose={() => setShowPreferenceFlow(false)} />}
      </AnimatePresence>

      {/* ── Cinematic hero intro ── */}
      <CinematicHero />

      {/* ── Classic hero with search (below cinematic scene) ── */}
      <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white overflow-hidden min-h-[70vh] flex items-center">
        {/* Animated blobs */}
        <Blob className="w-96 h-96 bg-white top-[-5rem] left-[-5rem]" />
        <Blob className="w-64 h-64 bg-yellow-300 bottom-[-2rem] right-[-2rem]" />
        <Blob className="w-48 h-48 bg-white top-1/2 right-1/4" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-8"
            >
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span>Smart housing search for Bangalore</span>
            </motion.div>

            {/* Headline — word by word */}
            <div className="mb-6 overflow-hidden">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {['Find', 'your', 'perfect'].map((word, i) => (
                  <motion.span key={i} variants={fadeUp} custom={i * 0.05} className="inline-block mr-4">
                    {word}
                  </motion.span>
                ))}
                <br />
                <motion.span
                  variants={fadeUp}
                  custom={0.2}
                  className="inline-block text-yellow-300"
                >
                  Bangalore stay
                </motion.span>
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-brand-100 mb-10 leading-relaxed max-w-xl"
            >
              PGs, apartments, shared flats and short-term stays — all in one place with map view, real reviews, and flatmate matching.
            </motion.p>

            {/* Search bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-3 max-w-xl"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <AnimatePresence mode="wait">
                  <motion.input
                    key={placeholder}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-14 pl-12 pr-4 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button type="submit" size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold shadow-lg h-14 px-6">
                  Search
                </Button>
              </motion.div>
            </motion.form>

            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPreferenceFlow(true)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm transition-colors"
              >
                <Sparkles className="h-4 w-4 text-yellow-300" />
                Smart Match — tell us what you need
              </motion.button>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/explore"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm transition-colors"
                >
                  <MapPin className="h-4 w-4" /> Browse map view
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="w-0.5 h-8 bg-white/40 rounded-full"
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      {/* ── Popular areas ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeInSection>
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Popular Areas</h2>
              <p className="text-sm text-gray-500 mt-0.5">Explore by neighbourhood</p>
            </div>
            <Link href="/explore" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {POPULAR_AREAS.map((area, i) => (
              <motion.div key={area.name} variants={cardVariant}>
                <Link
                  href={`/explore?area=${encodeURIComponent(area.name)}`}
                  className="group p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all text-center block"
                >
                  <motion.div
                    className="text-3xl mb-2"
                    whileHover={{ scale: 1.3, rotate: [-5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    {area.emoji}
                  </motion.div>
                  <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-600 transition-colors">{area.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{area.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Trust signals ── */}
      <section className="bg-white border-y border-gray-100 py-12">
        <FadeInSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: MapPin, label: <><Counter to={100} suffix="+" /> Listings</>, desc: 'Across 15+ Bangalore areas', color: 'brand' },
              { icon: Star, label: 'Real Reviews', desc: 'From verified residents', color: 'amber' },
              { icon: Shield, label: 'Verified Properties', desc: 'Admin-checked listings', color: 'green' },
            ].map(({ icon: Icon, label, desc, color }, i) => (
              <motion.div key={desc} variants={cardVariant} className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-3 ${
                    color === 'brand' ? 'bg-brand-50' : color === 'amber' ? 'bg-amber-50' : 'bg-green-50'
                  }`}
                >
                  <Icon className={`h-7 w-7 ${
                    color === 'brand' ? 'text-brand-600' : color === 'amber' ? 'text-amber-500' : 'text-green-600'
                  }`} />
                </motion.div>
                <p className="font-bold text-gray-900 text-xl">{label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </motion.div>
            ))}
          </div>
        </FadeInSection>
      </section>

      {/* ── Featured listings ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeInSection>
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
              <p className="text-sm text-gray-500 mt-0.5">Hand-picked stays across Bangalore</p>
            </div>
            <Link href="/explore" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
              See all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={cardVariant}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="h-52 bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                    <div className="h-6 bg-gray-100 rounded w-1/3 mt-3 animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredListings.map((p, i) => (
                <motion.div key={p.id} variants={cardVariant}>
                  <ListingCard property={p} />
                </motion.div>
              ))}
            </div>
          )}
        </FadeInSection>
      </section>

      {/* ── Promotions banner ── */}
      <FadeInSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <motion.div
          variants={fadeUp}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/promotions" className="block bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative group">
            <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
              <Tag className="h-full w-full" />
            </div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="h-5 w-5" />
                  <span className="font-bold text-lg">Special Offers & Promotions</span>
                </div>
                <p className="text-amber-100 text-sm">Exclusive discounts from verified properties across Bangalore</p>
              </div>
              <motion.div
                className="flex items-center gap-2 bg-white text-amber-600 font-semibold px-5 py-2.5 rounded-xl text-sm flex-shrink-0"
                whileHover={{ x: 4 }}
              >
                View Deals <ArrowRight className="h-4 w-4" />
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </FadeInSection>

      {/* ── Flatmate CTA ── */}
      <section className="bg-gradient-to-r from-brand-50 to-orange-50 border-y border-brand-100">
        <FadeInSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <motion.div variants={fadeUp} className="flex-1">
              <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-xs font-medium mb-3">
                <Users className="h-3.5 w-3.5" /> Community Feature
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Looking for a flatmate?</h2>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                Post your flatmate request or browse people looking to share flats in Bangalore. Connect directly — no middleman.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="flex gap-3 flex-shrink-0">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/flatmates"><Button variant="outline">Browse Posts</Button></Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link href="/flatmates?post=true"><Button>Post a Request</Button></Link>
              </motion.div>
            </motion.div>
          </div>
        </FadeInSection>
      </section>
    </>
  )
}
