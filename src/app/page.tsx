import SignInButton from '@/components/SignInButton'
import { 
  Users, 
  CreditCard, 
  Calculator, 
  Download, 
  Globe, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="relative px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TripExpense
            </span>
          </div>
          <SignInButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Split Expenses
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                with Friends
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The easiest way to track and split trip expenses. No more awkward conversations about money.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <SignInButton />
            <button className="flex items-center space-x-2 px-8 py-4 text-gray-700 hover:text-gray-900 transition-colors">
              <span>See how it works</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Image/Preview */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Trip Members</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-gray-700"> Mike </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
                      <span className="text-sm text-gray-700">Seth</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Recent Expenses</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Dinner</span>
                      <span className="font-medium text-green-600">$50.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Hotel</span>
                      <span className="font-medium text-green-600">$120.00</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calculator className="w-6 h-6 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Balances</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Mike</span>
                      <span className="font-medium text-green-600">+$25.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Seth</span>
                      <span className="font-medium text-red-600">-$25.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to split expenses
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, secure, and designed for real trips with real friends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Easy Group Management",
                description: "Invite friends with a simple link. No complicated setup required.",
                bgClass: "bg-gradient-to-r from-blue-500 to-blue-600"
              },
              {
                icon: CreditCard,
                title: "Track Every Expense",
                description: "Log expenses with categories, descriptions, and automatic equal splitting.",
                bgClass: "bg-gradient-to-r from-green-500 to-green-600"
              },
              {
                icon: Calculator,
                title: "Smart Balance Calculation",
                description: "See exactly who owes what with real-time balance updates.",
                bgClass: "bg-gradient-to-r from-purple-500 to-purple-600"
              },
              {
                icon: Download,
                title: "Export Your Data",
                description: "Download expenses and balances as CSV files for your records.",
                bgClass: "bg-gradient-to-r from-orange-500 to-orange-600"
              },
              {
                icon: Globe,
                title: "Works Everywhere",
                description: "Access your trips from any device, anywhere in the world.",
                bgClass: "bg-gradient-to-r from-indigo-500 to-indigo-600"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Your data is protected with enterprise-grade security.",
                bgClass: "bg-gradient-to-r from-red-500 to-red-600"
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 ${feature.bgClass} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes, not hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create a Trip",
                description: "Start by creating a new trip with your friends. Add a name and dates.",
                icon: "🏖️"
              },
              {
                step: "2",
                title: "Add Expenses",
                description: "Log every expense during your trip. We'll automatically split them equally.",
                icon: "💰"
              },
              {
                step: "3",
                title: "See Balances",
                description: "View who owes what and get smart suggestions for settling up.",
                icon: "⚖️"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to simplify your trip expenses?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who've made splitting expenses effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton />
            <button className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                TripExpense
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 TripExpense. Made with ❤️ for travelers everywhere.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
