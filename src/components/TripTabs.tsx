"use client"

import { useState } from 'react'
import ExpensesTab from './ExpensesTab'
import MembersTab from './MembersTab'
import BalancesTab from './BalancesTab'
import ExportTab from './ExportTab'
import { 
  CreditCard, 
  Users, 
  Calculator, 
  Download
} from 'lucide-react'

interface TripTabsProps {
  tripId: string
}

export default function TripTabs({ tripId }: TripTabsProps) {
  const [activeTab, setActiveTab] = useState('expenses')

  const tabs = [
    { 
      id: 'expenses', 
      label: 'Expenses', 
      icon: CreditCard,
      description: 'Track and manage expenses'
    },
    { 
      id: 'members', 
      label: 'Members', 
      icon: Users,
      description: 'Manage trip participants'
    },
    { 
      id: 'balances', 
      label: 'Balances', 
      icon: Calculator,
      description: 'View who owes what'
    },
    { 
      id: 'export', 
      label: 'Export', 
      icon: Download,
      description: 'Download your data'
    },
  ]

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {activeTab === 'expenses' && <ExpensesTab tripId={tripId} />}
        {activeTab === 'members' && <MembersTab tripId={tripId} />}
        {activeTab === 'balances' && <BalancesTab tripId={tripId} />}
        {activeTab === 'export' && <ExportTab tripId={tripId} />}
      </div>
    </div>
  )
}
