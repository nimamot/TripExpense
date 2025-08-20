"use server"

import { createServerSupabaseClient } from './supabase-server'
import { getUser } from './auth'
import { z } from 'zod'

const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return startDate <= endDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
})

export async function createTrip(data: z.infer<typeof createTripSchema>) {
  try {
    const validatedData = createTripSchema.parse(data)
    const user = await getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()
    
    // Create the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        name: validatedData.name,
        start_date: validatedData.startDate,
        end_date: validatedData.endDate,
        owner_id: user.id,
      })
      .select()
      .single()

    if (tripError) {
      console.error('Error creating trip:', tripError)
      return { error: 'Failed to create trip' }
    }

    // Add the creator as a member
    const { data: memberData, error: memberError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: trip.id,
        user_id: user.id,
        role: 'owner',
        status: 'active'
      })
      .select()

    console.log('Trip member creation result:', { memberData, memberError })

    if (memberError) {
      console.error('Error adding trip member:', memberError)
      return { error: 'Failed to add trip member' }
    }

    return { tripId: trip.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message }
    }
    console.error('Error in createTrip:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function ensureProfile() {
  try {
    const user = await getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const supabase = await createServerSupabaseClient()
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          display_name: user.user_metadata?.full_name || user.email || 'Unknown User',
          avatar_url: user.user_metadata?.avatar_url || '',
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        return { error: 'Failed to create profile' }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in ensureProfile:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function createExpense(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const tripId = formData.get('tripId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const currency = formData.get('currency') as string
    const category = formData.get('category') as string
    const memo = formData.get('memo') as string
    const spentAt = formData.get('spentAt') as string
    const payerId = formData.get('payerId') as string
    
    if (!tripId || !amount || !spentAt || !payerId) {
      throw new Error('Missing required fields')
    }
    
    // Convert amount to cents
    const amountCents = Math.round(amount * 100)
    
    // Insert expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        payer_id: payerId,
        amount_cents: amountCents,
        currency: currency || 'USD',
        category: category || 'Other',
        memo: memo || '',
        spent_at: spentAt
      })
      .select()
      .single()
    
    if (expenseError) {
      throw new Error(`Error creating expense: ${expenseError.message}`)
    }
    
    // Get trip members for equal splitting
    const { data: members } = await supabase
      .from('trip_members')
      .select('user_id')
      .eq('trip_id', tripId)
    
    if (members && members.length > 0) {
      // Calculate equal share per person
      const shareCents = Math.round(amountCents / members.length)
      
      // Create expense shares for all members
      const expenseShares = members.map(member => ({
        expense_id: expense.id,
        user_id: member.user_id,
        share_cents: shareCents
      }))
      
      const { error: sharesError } = await supabase
        .from('expense_shares')
        .insert(expenseShares)
      
      if (sharesError) {
        console.error('Error creating expense shares:', sharesError)
      }
    }
    
    return { success: true, expense }
  } catch (error) {
    console.error('Error creating expense:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function createInvite(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient()
    
    const tripId = formData.get('tripId') as string
    const email = formData.get('email') as string
    
    if (!tripId || !email) {
      throw new Error('Missing required fields')
    }
    
    // Generate a unique token
    const token = crypto.randomUUID()
    
    console.log('Creating invite:', { tripId, email, token })
    
    // Create invite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .insert({
        trip_id: tripId,
        email: email.toLowerCase().trim(),
        token: token
      })
      .select()
      .single()
    
    if (inviteError) {
      console.error('Invite creation error:', inviteError)
      throw new Error(`Error creating invite: ${inviteError.message}`)
    }
    
    console.log('Invite created successfully:', invite)
    return { success: true, invite }
  } catch (error) {
    console.error('Error creating invite:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
