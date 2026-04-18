import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Stayin Bangalore', template: '%s | Stayin Bangalore' },
  description: 'Find PGs, apartments, shared flats, and temporary stays in Bangalore. Smart search, map view, reviews, and flatmate matching.',
  keywords: ['PG Bangalore', 'apartments Bangalore', 'paying guest Bangalore', 'shared flat Bangalore', 'rent Bangalore'],
  openGraph: {
    title: 'Stayin Bangalore',
    description: 'Find your perfect stay in Bangalore',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers session={session}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
