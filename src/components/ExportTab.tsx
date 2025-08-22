"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Expense {
  id: string
  amount_cents: number
  currency: string
  category: string
  memo: string
  spent_at: string
  payer: {
    display_name: string
  }
}

interface Balance {
  user_id: string
  display_name: string
  net_cents: number
}

interface ExportTabProps {
  tripId: string
}

export default function ExportTab({ tripId }: ExportTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const downloadCSV = async (type: 'expenses' | 'balances') => {
    setIsLoading(true)
    setError('')

    try {
      if (type === 'expenses') {
        await downloadExpensesCSV()
      } else {
        await downloadBalancesCSV()
      }
    } catch (err) {
      setError('Failed to generate CSV')
      console.error('Error generating CSV:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadExpensesCSV = async () => {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        *,
        payer:profiles!expenses_payer_id_fkey(display_name)
      `)
      .eq('trip_id', tripId)
      .order('spent_at', { ascending: false })

    if (error) throw error

    const csvContent = generateExpensesCSV(expenses || [])
    downloadFile(csvContent, `trip-expenses-${tripId}.csv`)
  }

  const downloadBalancesCSV = async () => {
    // Get expenses and calculate balances (similar to BalancesTab)
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select(`
        id,
        payer_id,
        amount_cents,
        currency,
        expense_shares(user_id, share_cents)
      `)
      .eq('trip_id', tripId)

    if (expensesError) throw expensesError

    const { data: members, error: membersError } = await supabase
      .from('trip_members')
      .select(`
        user_id,
        profiles!trip_members_user_id_fkey(display_name)
      `)
      .eq('trip_id', tripId)
      .eq('status', 'active')

    if (membersError) throw membersError

    const balances = calculateBalances(expenses || [], members || [])
    const csvContent = generateBalancesCSV(balances)
    downloadFile(csvContent, `trip-balances-${tripId}.csv`)
  }

  const calculateBalances = (expenses: Array<{payer_id: string; amount_cents: number; expense_shares?: Array<{user_id: string; share_cents: number}>}>, members: Array<{user_id: string; profiles?: {display_name: string}}>) => {
    const balanceMap = new Map<string, { user_id: string; display_name: string; net_cents: number }>()

    members.forEach(member => {
      balanceMap.set(member.user_id, {
        user_id: member.user_id,
        display_name: member.profiles?.display_name || 'Unknown',
        net_cents: 0
      })
    })

    expenses.forEach(expense => {
      const payer = balanceMap.get(expense.payer_id)
      if (payer) {
        payer.net_cents += expense.amount_cents
      }

      expense.expense_shares?.forEach((share: {user_id: string; share_cents: number}) => {
        const member = balanceMap.get(share.user_id)
        if (member) {
          member.net_cents -= share.share_cents
        }
      })
    })

    return Array.from(balanceMap.values())
  }

  const generateExpensesCSV = (expenses: Expense[]) => {
    const headers = ['Date', 'Description', 'Category', 'Paid By', 'Amount', 'Currency']
    const rows = expenses.map(expense => [
      new Date(expense.spent_at).toLocaleDateString(),
      expense.memo || 'No description',
      expense.category || 'Uncategorized',
      expense.payer?.display_name || 'Unknown',
      (expense.amount_cents / 100).toFixed(2),
      expense.currency
    ])

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')
  }

  const generateBalancesCSV = (balances: Balance[]) => {
    const headers = ['Member', 'Net Balance (USD)']
    const rows = balances.map(balance => [
      balance.display_name,
      (balance.net_cents / 100).toFixed(2)
    ])

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Data</h2>
        <p className="text-gray-600 mb-6">
          Download your trip data as CSV files for record keeping or analysis.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Expenses Export */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Expenses</h3>
                <p className="text-sm text-gray-500">All expenses with details</p>
              </div>
            </div>
            <button
              onClick={() => downloadCSV('expenses')}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Generating...' : 'Download Expenses CSV'}
            </button>
          </div>

          {/* Balances Export */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Balances</h3>
                <p className="text-sm text-gray-500">Current net balances</p>
              </div>
            </div>
            <button
              onClick={() => downloadCSV('balances')}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Generating...' : 'Download Balances CSV'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Export Information</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Expenses CSV includes: Date, Description, Category, Paid By, Amount, Currency</li>
          <li>• Balances CSV includes: Member Name, Net Balance</li>
          <li>• All amounts are in cents for precision</li>
          <li>• Files are automatically downloaded to your device</li>
        </ul>
      </div>
    </div>
  )
}
