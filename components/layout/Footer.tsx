import Link from 'next/link'
import { MapPin, Github, Twitter, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="font-bold text-white text-lg">Stayin Bangalore</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Find your perfect place to stay in Bangalore — PGs, apartments, shared flats, and short-term stays, all in one place.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Explore</h3>
            <ul className="space-y-2 text-sm">
              {[
                ['PG Accommodations', '/explore?propertyType=PG'],
                ['Apartments', '/explore?propertyType=APARTMENT'],
                ['Shared Flats', '/explore?propertyType=FLAT'],
                ['Hostels', '/explore?propertyType=HOSTEL'],
                ['Find a Flatmate', '/flatmates'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Areas</h3>
            <ul className="space-y-2 text-sm">
              {[
                'Koramangala', 'HSR Layout', 'Indiranagar',
                'Whitefield', 'Electronic City', 'Marathahalli',
              ].map((area) => (
                <li key={area}>
                  <Link href={`/explore?area=${area}`} className="hover:text-white transition-colors">
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Stayin Bangalore. Built for Bangaloreans.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors"><Github className="h-4 w-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter className="h-4 w-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
