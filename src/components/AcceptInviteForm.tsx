'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Invite {
  id: string
  trip_id: string
  email: string
  trips: {
    name: string
    owner_id: string
  }
}

interface AcceptInviteFormProps {
  invite: Invite
}

export default function AcceptInviteForm({ invite }: AcceptInviteFormProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAccept = async () => {
    setIsAccepting(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('trip_members')
        .select('*')
        .eq('trip_id', invite.trip_id)
        .eq('user_id', user.id)
        .single()

      if (existingMember) {
        // If already a member, just mark the invite as redeemed and redirect
        await supabase
          .from('invites')
          .update({ redeemed_at: new Date().toISOString() })
          .eq('id', invite.id)
        
        router.push(`/app/trips/${invite.trip_id}`)
        return
      }

      // Add user as trip member
      const { error: memberError } = await supabase
        .from('trip_members')
        .insert({
          trip_id: invite.trip_id,
          user_id: user.id,
          role: 'member',
          status: 'active'
        })

      if (memberError) {
        throw new Error('Failed to join trip')
      }

      // Mark invite as redeemed
      const { error: redeemError } = await supabase
        .from('invites')
        .update({ redeemed_at: new Date().toISOString() })
        .eq('id', invite.id)

      if (redeemError) {
        console.error('Error marking invite as redeemed:', redeemError)
      }

      // Redirect to trip page
      router.push(`/app/trips/${invite.trip_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite')
      console.error('Error accepting invite:', err)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = () => {
    router.push('/app')
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Join "{invite.trips.name}"
        </h3>
        <p className="text-sm text-gray-600">
          You&apos;ve been invited to join this trip and track expenses together.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleAccept}
          disabled={isAccepting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isAccepting ? 'Joining...' : 'Accept Invitation'}
        </button>
        <button
          onClick={handleDecline}
          disabled={isAccepting}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  )
}
