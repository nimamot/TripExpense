"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createExpense } from '@/lib/actions'

interface Member {
  user_id: string
  display_name: string
}

interface ExpenseFormProps {
  tripId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function ExpenseForm({ tripId, onSuccess, onCancel }: ExpenseFormProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    category: '',
    memo: '',
    spentAt: new Date().toISOString().split('T')[0],
    payerId: '',
    splitMethod: 'equal'
  })

  const supabase = createClient()

  const loadMembers = useCallback(async () => {
    try {
      console.log('Loading members for expense form, trip:', tripId)
      
      // First, get trip members
      const { data: members, error: membersError } = await supabase
        .from('trip_members')
        .select('user_id')
        .eq('trip_id', tripId)
        .eq('status', 'active')

      console.log('ExpenseForm members query result:', { members, error: membersError })

      if (membersError) {
        console.error('ExpenseForm members query error:', membersError)
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

      console.log('ExpenseForm profiles query result:', { profiles, error: profilesError })

      if (profilesError) {
        console.error('ExpenseForm profiles query error:', profilesError)
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
        display_name: profileMap.get(member.user_id) || member.user_id.substring(0, 8) + '...'
      }))
      
      console.log('ExpenseForm processed member data:', memberData)
      setMembers(memberData)
      if (memberData.length > 0 && !formData.payerId) {
        setFormData(prev => ({ ...prev, payerId: memberData[0].user_id }))
      }
    } catch (err) {
      setError('Failed to load trip members')
      console.error('Error loading members:', err)
    }
  }, [tripId])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const amountCents = Math.round(parseFloat(formData.amount) * 100)
      if (isNaN(amountCents) || amountCents <= 0) {
        throw new Error('Please enter a valid amount')
      }

      // Create FormData for server action
      const formDataObj = new FormData()
      formDataObj.append('tripId', tripId)
      formDataObj.append('amount', formData.amount)
      formDataObj.append('currency', formData.currency)
      formDataObj.append('category', formData.category)
      formDataObj.append('memo', formData.memo)
      formDataObj.append('spentAt', formData.spentAt)
      formDataObj.append('payerId', formData.payerId)

      const result = await createExpense(formDataObj)

      if (result.success) {
        onSuccess()
      } else {
        throw new Error(result.error || 'Failed to create expense')
      }

      // The server action handles expense shares creation
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense')
      console.error('Error creating expense:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Expense</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="0.00"
              />
              <span className="absolute left-3 top-2 text-gray-500 text-sm">
                {formData.currency}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="e.g., Food, Transport, Accommodation"
            />
          </div>

          <div>
            <label htmlFor="spentAt" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="spentAt"
              required
              value={formData.spentAt}
              onChange={(e) => setFormData(prev => ({ ...prev, spentAt: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
                      <input
              type="text"
              id="memo"
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              placeholder="What was this expense for?"
            />
        </div>

        <div>
          <label htmlFor="payerId" className="block text-sm font-medium text-gray-700 mb-1">
            Paid By
          </label>
                      <select
              id="payerId"
              required
              value={formData.payerId}
              onChange={(e) => setFormData(prev => ({ ...prev, payerId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
            <option value="">Select who paid</option>
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.display_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Adding...' : 'Add Expense'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
