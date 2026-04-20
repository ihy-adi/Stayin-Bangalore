'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { MapPin, Menu, X, Heart, User, LogOut, LayoutDashboard, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getInitials } from '@/lib/utils'

export function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg group-hover:bg-brand-700 transition-colors">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="font-bold text-gray-900 text-lg leading-tight">
              Stayin<span className="text-brand-600"> Bangalore</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
              Explore
            </Link>
            <Link href="/promotions" className="text-sm text-gray-600 hover:text-amber-600 font-medium transition-colors flex items-center gap-1">
              <span className="text-amber-500">🏷️</span> Promotions
            </Link>
            <Link href="/share-space" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
              Share Space
            </Link>
            <Link href="/flatmates" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
              Find Flatmate
            </Link>
            {session?.user.role === 'ADMIN' && (
              <Link href="/admin" className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 hover:shadow-md transition-shadow"
                >
                  <div className="h-7 w-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.user.image} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      getInitials(session.user.name ?? 'U')
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{session.user.name?.split(' ')[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Heart className="h-4 w-4" /> Saved Listings
                    </Link>
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut() }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/explore" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2">
            Explore Listings
          </Link>
          <Link href="/promotions" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-amber-600 py-2">
            🏷️ Promotions
          </Link>
          <Link href="/share-space" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2">
            Share Space
          </Link>
          <Link href="/flatmates" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2">
            Find a Flatmate
          </Link>
          {session ? (
            <>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2">
                Profile
              </Link>
              <Link href="/saved" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2">
                Saved Listings
              </Link>
              <button
                onClick={() => { setMobileOpen(false); signOut() }}
                className="block w-full text-left text-sm font-medium text-red-600 py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
