'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ArrowRight, ArrowLeft, Briefcase, GraduationCap, Laptop, Home } from 'lucide-react'

type Step = 'userType' | 'stayType' | 'budget' | 'area' | 'preferences'

const USER_TYPES = [
  { value: 'student', label: 'Student', icon: GraduationCap, desc: 'College or university student' },
  { value: 'hybrid', label: 'Hybrid Worker', icon: Briefcase, desc: 'Office 2–3 days a week' },
  { value: 'remote', label: 'Remote Worker', icon: Laptop, desc: 'Work from home full time' },
  { value: 'other', label: 'Other', icon: Home, desc: 'Relocation, family, etc.' },
]

const STAY_TYPES = [
  { value: 'PG', label: 'PG / Hostel', desc: 'Managed accommodation with meals' },
  { value: 'APARTMENT', label: 'Apartment', desc: 'Independent 1BHK / 2BHK' },
  { value: 'SHARED_FLAT', label: 'Shared Flat', desc: 'Share with flatmates' },
  { value: 'TEMPORARY', label: 'Temporary Stay', desc: 'Short-term / service apartment' },
]

const BUDGET_RANGES = [
  { label: 'Under ₹8,000', min: 0, max: 8000 },
  { label: '₹8,000 – ₹12,000', min: 8000, max: 12000 },
  { label: '₹12,000 – ₹18,000', min: 12000, max: 18000 },
  { label: '₹18,000 – ₹25,000', min: 18000, max: 25000 },
  { label: 'Above ₹25,000', min: 25000, max: undefined },
]

const AREAS = [
  'Koramangala', 'HSR Layout', 'Indiranagar', 'Whitefield',
  'Electronic City', 'Marathahalli', 'BTM Layout', 'Jayanagar', 'Any area',
]

interface PreferenceFlowProps {
  onClose: () => void
}

export function PreferenceFlow({ onClose }: PreferenceFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('userType')
  const [answers, setAnswers] = useState({
    userType: '',
    stayType: '',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    area: '',
    hasAC: false,
    foodIncluded: false,
    roomType: '',
  })

  const steps: Step[] = ['userType', 'stayType', 'budget', 'area', 'preferences']
  const currentIndex = steps.indexOf(step)

  function next() {
    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1])
    else finishAndSearch()
  }

  function back() {
    if (currentIndex > 0) setStep(steps[currentIndex - 1])
  }

  function finishAndSearch() {
    const params = new URLSearchParams()
    if (answers.stayType) params.set('stayType', answers.stayType)
    if (answers.minPrice !== undefined) params.set('minPrice', String(answers.minPrice))
    if (answers.maxPrice !== undefined) params.set('maxPrice', String(answers.maxPrice))
    if (answers.area && answers.area !== 'Any area') params.set('area', answers.area)
    if (answers.hasAC) params.set('hasAC', 'true')
    if (answers.foodIncluded) params.set('foodIncluded', 'true')
    if (answers.roomType) params.set('roomType', answers.roomType)
    router.push(`/explore?${params.toString()}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-brand-600 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <div className="mb-6">
            <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">
              Step {currentIndex + 1} of {steps.length}
            </p>

            {step === 'userType' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Who are you?</h2>
                <p className="text-sm text-gray-500 mt-1">We'll personalize results for you</p>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  {USER_TYPES.map((u) => (
                    <button
                      key={u.value}
                      onClick={() => setAnswers((a) => ({ ...a, userType: u.value }))}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        answers.userType === u.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-brand-300'
                      }`}
                    >
                      <u.icon className={`h-6 w-6 mb-2 ${answers.userType === u.value ? 'text-brand-600' : 'text-gray-400'}`} />
                      <p className="font-semibold text-sm text-gray-900">{u.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{u.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'stayType' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">What type of stay?</h2>
                <div className="space-y-2 mt-5">
                  {STAY_TYPES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setAnswers((a) => ({ ...a, stayType: s.value }))}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                        answers.stayType === s.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-brand-300'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{s.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'budget' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">What's your budget?</h2>
                <p className="text-sm text-gray-500 mt-1">Monthly rent in Bangalore</p>
                <div className="space-y-2 mt-5">
                  {BUDGET_RANGES.map((b) => (
                    <button
                      key={b.label}
                      onClick={() => setAnswers((a) => ({ ...a, minPrice: b.min, maxPrice: b.max }))}
                      className={`w-full p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                        answers.minPrice === b.min && answers.maxPrice === b.max
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-700 hover:border-brand-300'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'area' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Preferred area?</h2>
                <div className="flex flex-wrap gap-2 mt-5">
                  {AREAS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAnswers((ans) => ({ ...ans, area: a }))}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                        answers.area === a
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-200 text-gray-600 hover:border-brand-300'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'preferences' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Any must-haves?</h2>
                <div className="space-y-3 mt-5">
                  {[
                    { key: 'hasAC', label: 'Air Conditioning (AC)' },
                    { key: 'foodIncluded', label: 'Meals / Food Included' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-brand-300">
                      <input
                        type="checkbox"
                        checked={answers[key as 'hasAC' | 'foodIncluded']}
                        onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.checked }))}
                        className="h-5 w-5 rounded text-brand-600"
                      />
                      <span className="font-medium text-sm text-gray-900">{label}</span>
                    </label>
                  ))}
                  <div className="p-4 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Room Type</p>
                    <div className="flex gap-3">
                      {['PRIVATE', 'SHARED'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setAnswers((a) => ({ ...a, roomType: a.roomType === r ? '' : r }))}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                            answers.roomType === r
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {r === 'PRIVATE' ? 'Private Room' : 'Shared Room'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-3">
              {currentIndex > 0 && (
                <Button variant="ghost" size="sm" onClick={back}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400">
                Skip
              </Button>
            </div>
            <Button onClick={next}>
              {currentIndex === steps.length - 1 ? 'Find Places' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
