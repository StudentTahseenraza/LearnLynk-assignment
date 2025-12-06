import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">LearnLynk CRM</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Admissions CRM Dashboard for managing leads, applications, and tasks
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Leads Management</h3>
            <p className="text-gray-600">Track and manage potential students throughout their journey</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Applications</h3>
            <p className="text-gray-600">Manage application status, documents, and communication</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasks</h3>
            <p className="text-gray-600">Stay organized with calls, emails, and review reminders</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard/today"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Go to Dashboard
          </Link>
          <p className="text-gray-500 text-sm">
            Test the complete implementation with today&apos;s tasks dashboard
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Technical Implementation Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">Supabase Schema</span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">RLS Policies</span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">Edge Functions</span>
            <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">Next.js 14</span>
            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm">TypeScript</span>
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">React Query</span>
            <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm">Tailwind CSS</span>
            <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-sm">Stripe Integration</span>
          </div>
        </div>
      </div>
    </div>
  )
}