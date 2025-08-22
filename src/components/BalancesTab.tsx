"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

interface Balance {
  user_id: string
  display_name: string
  net_cents: number
}

interface Settlement {
  from: string
  to: string
  amount_cents: number
}

interface BalancesTabProps {
  tripId: string
}

export default function BalancesTab({ tripId }: BalancesTabProps) {
  const [balances, setBalances] = useState<Balance[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = createClient()

  const loadBalances = useCallback(async () => {
    try {

      
      // Get all expenses for the trip
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('id, payer_id, amount_cents, currency')
        .eq('trip_id', tripId)



      if (expensesError) {
        console.error('BalancesTab expenses query error:', expensesError)
        throw expensesError
      }

      // Get expense shares for all expenses
      let expenseShares: Array<{expense_id: string; user_id: string; share_cents: number}> = []
      if (expenses && expenses.length > 0) {
        const expenseIds = expenses.map(e => e.id)
        const { data: shares, error: sharesError } = await supabase
          .from('expense_shares')
          .select('expense_id, user_id, share_cents')
          .in('expense_id', expenseIds)



        if (sharesError) {
          console.error('BalancesTab expense shares query error:', sharesError)
          throw sharesError
        }

        expenseShares = shares || []
      }

      // Get all trip members
      const { data: members, error: membersError } = await supabase
        .from('trip_members')
        .select('user_id')
        .eq('trip_id', tripId)
        .eq('status', 'active')



      if (membersError) {
        console.error('BalancesTab members query error:', membersError)
        throw membersError
      }

      if (!members || members.length === 0) {
        setBalances([])
        setSettlements([])
        return
      }

      // Get profiles for all user IDs
      const userIds = members.map(m => m.user_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds)



      if (profilesError) {
        console.error('BalancesTab profiles query error:', profilesError)
        throw profilesError
      }

      // Create a map of user_id to display_name
      const profileMap = new Map()
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, profile.display_name)
      })

      // Calculate net balances
      const balanceMap = new Map<string, { user_id: string; display_name: string; net_cents: number }>()

      // Initialize all members with 0 balance
      members?.forEach(member => {
        balanceMap.set(member.user_id, {
          user_id: member.user_id,
          display_name: profileMap.get(member.user_id) || member.user_id.substring(0, 8) + '...',
          net_cents: 0
        })
      })

      // Calculate net balances
      expenses?.forEach(expense => {
        const payer = balanceMap.get(expense.payer_id)
        if (payer) {
          payer.net_cents += expense.amount_cents
        }

        // Get shares for this expense
        const sharesForExpense = expenseShares.filter(share => share.expense_id === expense.id)
        sharesForExpense.forEach((share: {expense_id: string; user_id: string; share_cents: number}) => {
          const member = balanceMap.get(share.user_id)
          if (member) {
            member.net_cents -= share.share_cents
          }
        })
      })

      const balanceData = Array.from(balanceMap.values())

      setBalances(balanceData)

      // Calculate suggested settlements (create a deep copy to avoid modifying the original data)
      const balanceDataCopy = balanceData.map(balance => ({
        ...balance,
        net_cents: balance.net_cents
      }))
      const settlementsData = suggestSettlements(balanceDataCopy)
      setSettlements(settlementsData)

    } catch (err) {
      setError('Failed to load balances')
      console.error('Error loading balances:', err)
    } finally {
      setIsLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    loadBalances()
  }, [loadBalances])

  const suggestSettlements = (nets: Balance[]): Settlement[] => {
    const debtors = nets.filter(n => n.net_cents < 0).sort((a, b) => a.net_cents - b.net_cents)
    const creditors = nets.filter(n => n.net_cents > 0).sort((a, b) => b.net_cents - a.net_cents)
    const txns: Settlement[] = []
    let i = 0, j = 0

    while (i < debtors.length && j < creditors.length) {
      const owe = -debtors[i].net_cents
      const due = creditors[j].net_cents
      const pay = Math.min(owe, due)
      
      txns.push({ 
        from: debtors[i].user_id, 
        to: creditors[j].user_id, 
        amount_cents: pay 
      })
      
      debtors[i].net_cents += pay
      creditors[j].net_cents -= pay
      
      if (Math.abs(debtors[i].net_cents) < 1) i++
      if (Math.abs(creditors[j].net_cents) < 1) j++
    }

    return txns
  }

  const formatCurrency = (cents: number, currency: string = 'USD') => {
    return `${currency} ${(cents / 100).toFixed(2)}`
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading balances...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Balances</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Net Balances */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Net Balances</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {balances.map((balance) => (
                <div key={balance.user_id} className="px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium text-sm">
                        {balance.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {balance.display_name}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    balance.net_cents > 0 
                      ? 'text-green-600' 
                      : balance.net_cents < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {formatCurrency(balance.net_cents)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Settlements */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Suggested Settlements</h3>
            </div>
            {settlements.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>All balances are settled! 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {settlements.map((settlement, index) => {
                  const fromMember = balances.find(b => b.user_id === settlement.from)
                  const toMember = balances.find(b => b.user_id === settlement.to)
                  
                  return (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {fromMember?.display_name}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm font-medium text-gray-900">
                            {toMember?.display_name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">
                          {formatCurrency(settlement.amount_cents)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How it works</h4>
        <p className="text-sm text-blue-700">
          Net balances show how much each person is owed (positive) or owes (negative). 
          Suggested settlements show the minimum payments needed to settle all debts.
        </p>
      </div>
    </div>
  )
}
