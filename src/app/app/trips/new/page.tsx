import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TripForm from '@/components/TripForm'

export default async function NewTripPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Trip</h1>
        <p className="text-gray-600">Set up your trip details and invite friends</p>
      </div>
      
      <div className="max-w-2xl">
        <TripForm />
      </div>
    </div>
  )
}
