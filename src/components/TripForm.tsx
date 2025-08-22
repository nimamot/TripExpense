"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTrip } from '@/lib/actions'
import { Plus, Calendar, MapPin, Loader2 } from 'lucide-react'

export default function TripForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    const result = await createTrip({ name, startDate, endDate })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.tripId) {
      router.push(`/app/trips/${result.tripId}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Trip</h1>
        <p className="text-gray-600">
          Set up your trip details and start tracking expenses with friends.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Trip Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Trip Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-colors"
                placeholder="e.g., Mexico Beach Trip 2024"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Trip...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Create Trip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
              You&apos;ll be able to invite friends and start adding expenses once your trip is created.
            </p>
      </div>
    </div>
  )
}
