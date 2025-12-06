import Link from 'next/link'

export default function DashboardPage() {
  const cards = [
    {
      title: "Today's Tasks",
      description: "View and manage tasks due today",
      href: "/dashboard/today",
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      stats: "3 pending"
    },
    {
      title: "Leads",
      description: "Manage potential student leads",
      href: "/dashboard/leads",
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.5a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      stats: "42 active"
    },
    {
      title: "Applications",
      description: "Track application progress",
      href: "/dashboard/applications",
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      stats: "18 in review"
    },
    {
      title: "Analytics",
      description: "View reports and insights",
      href: "/dashboard/analytics",
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      stats: "Monthly reports"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to LearnLynk CRM Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className={`${card.color} border rounded-xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                </div>
                <div className="p-2 rounded-lg bg-white">
                  {card.icon}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {card.stats}
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-gray-900 mb-3">Create New Lead</h3>
              <p className="text-sm text-gray-600 mb-4">Add a new potential student to the system</p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                + Add Lead
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:border-green-300 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-gray-900 mb-3">Schedule Task</h3>
              <p className="text-sm text-gray-600 mb-4">Create a new call, email, or review task</p>
              <button className="text-green-600 text-sm font-medium hover:text-green-800">
                + New Task
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-gray-900 mb-3">Generate Report</h3>
              <p className="text-sm text-gray-600 mb-4">Create performance and conversion reports</p>
              <button className="text-purple-600 text-sm font-medium hover:text-purple-800">
                View Reports
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-900">Getting Started</h3>
              <div className="mt-2 text-blue-700">
                <p>Start by exploring Today&apos;s Tasks or navigate to any section using the menu above.</p>
                <p className="mt-1 text-sm">All sections are fully functional with mock data for demonstration.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}