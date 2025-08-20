"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import ExpenseForm from './ExpenseForm'

interface Expense {
  id: string
  amount_cents: number
  currency: string
  category: string
  memo: string
  spent_at: string
  created_at: string
  payer: {
    display_name: string
  }
}

interface ExpensesTabProps {
  tripId: string
}

export default function ExpensesTab({ tripId }: ExpensesTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadExpenses()
  }, [tripId])

  const loadExpenses = async () => {
    try {
      console.log('Loading expenses for trip:', tripId)
      
      // First, get expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('spent_at', { ascending: false })

      console.log('Expenses query result:', { expenses, error: expensesError })

      if (expensesError) {
        console.error('Expenses query error:', expensesError)
        throw expensesError
      }

      if (!expenses || expenses.length === 0) {
        setExpenses([])
        return
      }

      // Then, get profiles for all payer IDs
      const payerIds = expenses.map(e => e.payer_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', payerIds)

      console.log('Expenses profiles query result:', { profiles, error: profilesError })

      if (profilesError) {
        console.error('Expenses profiles query error:', profilesError)
        throw profilesError
      }

      // Create a map of user_id to display_name
      const profileMap = new Map()
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, profile.display_name)
      })

      // Combine the data
      const expensesWithPayerNames = expenses.map(expense => ({
        ...expense,
        payer: {
          display_name: profileMap.get(expense.payer_id) || expense.payer_id.substring(0, 8) + '...'
        }
      }))
      
      setExpenses(expensesWithPayerNames)
    } catch (err) {
      setError('Failed to load expenses')
      console.error('Error loading expenses:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExpenseCreated = () => {
    setShowForm(false)
    loadExpenses()
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading expenses...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Expense
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <ExpenseForm 
            tripId={tripId} 
            onSuccess={handleExpenseCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-gray-600 mb-4">Add your first expense to start tracking</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add First Expense
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(expense.spent_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {expense.memo || 'No description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.category || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.payer?.display_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {expense.currency} {(expense.amount_cents / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
