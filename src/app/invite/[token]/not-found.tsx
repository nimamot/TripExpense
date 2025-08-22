import Link from 'next/link'

export default function InviteNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Invalid Invitation
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          This invitation link is invalid or has expired
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <p className="text-gray-600 mb-6">
            The invitation you&apos;re trying to access doesn&apos;t exist or has already been used.
          </p>
          <Link
            href="/app"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
