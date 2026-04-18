'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Mail, Phone, Heart, MessageSquare, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', bio: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (session?.user) {
      setForm({ name: session.user.name ?? '', bio: '', phone: '' })
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
        <div className="flex items-start gap-6 mb-6">
          <div className="h-20 w-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              getInitials(session.user.name ?? 'U')
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{session.user.name}</h2>
            <p className="text-sm text-gray-500">{session.user.email}</p>
            {session.user.role === 'ADMIN' && (
              <span className="inline-block mt-1 bg-brand-100 text-brand-700 text-xs font-medium px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        {editing ? (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name</label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
              <Input placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Bio</label>
              <textarea
                placeholder="Tell people a bit about yourself…"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="h-4 w-4 text-gray-400" />
              {session.user.email}
            </div>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/saved" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
          <Heart className="h-8 w-8 text-red-400 mb-3" />
          <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">Saved Listings</p>
          <p className="text-xs text-gray-400 mt-0.5">Properties you've bookmarked</p>
        </Link>
        <Link href="/flatmates" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
          <Users className="h-8 w-8 text-blue-400 mb-3" />
          <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">Flatmate Posts</p>
          <p className="text-xs text-gray-400 mt-0.5">Your flatmate requests</p>
        </Link>
        {session.user.role === 'ADMIN' && (
          <Link href="/admin" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <User className="h-8 w-8 text-brand-400 mb-3" />
            <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">Admin Dashboard</p>
            <p className="text-xs text-gray-400 mt-0.5">Manage listings & users</p>
          </Link>
        )}
      </div>
    </div>
  )
}
