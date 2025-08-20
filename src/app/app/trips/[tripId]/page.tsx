import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import TripTabs from '@/components/TripTabs'
import { Calendar, Users, MapPin } from 'lucide-react'

interface TripPageProps {
  params: Promise<{ tripId: string }>
}

export default async function TripPage({ params }: TripPageProps) {
  const resolvedParams = await params
  const tripId = resolvedParams.tripId

  const supabase = await createServerSupabaseClient()
  
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single()

  if (error || !trip) {
    notFound()
  }

  // Get trip members count
  const { data: members } = await supabase
    .from('trip_members')
    .select('user_id')
    .eq('trip_id', tripId)
    .eq('status', 'active')

  const memberCount = members?.length || 0

  return (
    <div className="space-y-8">
      {/* Trip Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="max-w-4xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{trip.name}</h1>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-sm">Trip Status</div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-blue-100">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Created {new Date(trip.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Content */}
      <TripTabs tripId={tripId} />
    </div>
  )
}
