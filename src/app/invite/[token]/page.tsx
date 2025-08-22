import { getUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import AcceptInviteForm from '@/components/AcceptInviteForm'

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const user = await getUser()
  const resolvedParams = await params
  
  if (!user) {
    redirect('/')
  }

  const supabase = await createServerSupabaseClient()
  
  // First, let's check if the invite exists at all
  const { data: allInvites, error: allInvitesError } = await supabase
    .from('invites')
    .select('*')
    .eq('token', resolvedParams.token)

  console.log('All invites with token:', { token: resolvedParams.token, allInvites, error: allInvitesError })
  
  // Get invite details
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select(`
      *,
      trips(name, owner_id)
    `)
    .eq('token', resolvedParams.token)
    .is('redeemed_at', null)
    .single()

  console.log('Invite lookup:', { token: resolvedParams.token, invite, error: inviteError })

  if (!invite) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Accept Trip Invitation
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You&apos;ve been invited to join a trip
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AcceptInviteForm invite={invite} />
        </div>
      </div>
    </div>
  )
}
