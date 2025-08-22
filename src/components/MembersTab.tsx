"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createInvite } from '@/lib/actions'

interface Member {
  user_id: string
  display_name: string
  role: string
  added_at: string
}

interface Invite {
  id: string
  email: string
  token: string
  created_at: string
  redeemed_at: string | null
}

interface MembersTabProps {
  tripId: string
}

export default function MembersTab({ tripId }: MembersTabProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const supabase = createClient()

  const loadMembers = useCallback(async () => {
    try {
      console.log('Loading members for trip:', tripId)
      
      // First, get trip members
      const { data: members, error: membersError } = await supabase
        .from('trip_members')
        .select('user_id, role, added_at')
        .eq('trip_id', tripId)
        .eq('status', 'active')
        .order('added_at', { ascending: true })

      console.log('Members query result:', { members, error: membersError })

      if (membersError) {
        console.error('Members query error:', membersError)
        throw membersError
      }

      if (!members || members.length === 0) {
        setMembers([])
        return
      }

      // Then, get profiles for all user IDs
      const userIds = members.map(m => m.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds)

      console.log('Profiles query result:', { profiles, error: profilesError })

      if (profilesError) {
        console.error('Profiles query error:', profilesError)
        throw profilesError
      }

      // Create a map of user_id to display_name
      const profileMap = new Map()
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, profile.display_name)
      })

      // Combine the data
      const memberData = members.map(member => ({
        user_id: member.user_id,
        display_name: profileMap.get(member.user_id) || member.user_id.substring(0, 8) + '...',
        role: member.role,
        added_at: member.added_at
      }))
      
      console.log('Processed member data:', memberData)
      setMembers(memberData)
    } catch (err) {
      setError('Failed to load members')
      console.error('Error loading members:', err)
    } finally {
      setIsLoading(false)
    }
  }, [tripId])

  const loadInvites = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('trip_id', tripId)
        .is('redeemed_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvites(data || [])
    } catch (err) {
      console.error('Error loading invites:', err)
    }
  }, [tripId])

  useEffect(() => {
    loadMembers()
    loadInvites()
  }, [loadMembers, loadInvites])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('tripId', tripId)
      formData.append('email', inviteEmail)

      const result = await createInvite(formData)

      if (result.success) {
        setInviteEmail('')
        loadInvites() // Refresh invites list
        alert('Invite created successfully! Share the invite link with your friend.')
      } else {
        setError(result.error || 'Failed to create invite')
      }
    } catch (err) {
      setError('Failed to send invite')
      console.error('Error sending invite:', err)
    } finally {
      setIsInviting(false)
    }
  }

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(inviteUrl)
    alert('Invite link copied to clipboard!')
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading members...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Trip Members</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium text-sm">
                          {member.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.display_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.role === 'owner' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.added_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Invites</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invited
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invite.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invite.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => copyInviteLink(invite.token)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Copy Link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite New Member</h3>
        
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="friend@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isInviting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isInviting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          After creating an invite, copy the link and share it with your friend. They can use the link to join the trip.
        </p>
      </div>
    </div>
  )
}
