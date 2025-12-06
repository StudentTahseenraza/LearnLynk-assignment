'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchDashboardStats } from '../../../lib/queries'
import { Users, FileText, Calendar, TrendingUp, BarChart3, PieChart, Activity, Target } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-red-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error loading analytics</h3>
                <p className="text-red-700 mt-1">Failed to fetch dashboard statistics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">Performance insights and data visualization</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Leads</div>
                <div className="text-2xl font-bold text-gray-900">{stats?.leads || 0}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Total active leads in system
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Applications</div>
                <div className="text-2xl font-bold text-gray-900">{stats?.applications || 0}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Total applications received
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Tasks Today</div>
                <div className="text-2xl font-bold text-gray-900">{stats?.tasksToday || 0}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Tasks due today
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Conversion Rate</div>
                <div className="text-2xl font-bold text-gray-900">{stats?.conversionRate || 0}%</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Lead to acceptance rate
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
                <p className="text-sm text-gray-600">New leads over the past 6 months</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-4">
              {stats?.monthlyTrends && Object.entries(stats.monthlyTrends).map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{month}</span>
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${(count / Math.max(...Object.values(stats.monthlyTrends))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Task Overview</h3>
                <p className="text-sm text-gray-600">Distribution by priority and status</p>
              </div>
              <PieChart className="w-6 h-6 text-green-600" />
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">By Priority</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">High Priority</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Medium Priority</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Low Priority</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">8</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">By Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Pending</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">In Progress</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Completed</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">14</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-600">Latest tasks and updates</p>
            </div>
            <Activity className="w-6 h-6 text-gray-600" />
          </div>
          <div className="space-y-4">
            {stats?.recentActivity?.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${
                    task.type === 'call' ? 'bg-blue-100' :
                    task.type === 'email' ? 'bg-purple-100' :
                    'bg-amber-100'
                  }`}>
                    <span className={`text-sm font-medium ${
                      task.type === 'call' ? 'text-blue-600' :
                      task.type === 'email' ? 'text-purple-600' :
                      'text-amber-600'
                    }`}>
                      {task.type.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    <div className="text-xs text-gray-500">
                      {task.applications?.leads && (
                        <>For {task.applications.leads.first_name} {task.applications.leads.last_name}</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-900">
                    {new Date(task.due_at).toLocaleDateString()}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Performance Metrics</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Response Time</span>
                <span className="text-sm font-medium text-gray-900">2.4 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Task Completion Rate</span>
                <span className="text-sm font-medium text-gray-900">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Lead Response Rate</span>
                <span className="text-sm font-medium text-gray-900">92%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-green-600 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Team Overview</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Counselors</span>
                <span className="text-sm font-medium text-gray-900">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Leads per Counselor</span>
                <span className="text-sm font-medium text-gray-900">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Team Productivity</span>
                <span className="text-sm font-medium text-gray-900">85%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 text-orange-600 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Goals & Targets</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Target</span>
                <span className="text-sm font-medium text-gray-900">50 applications</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Progress</span>
                <span className="text-sm font-medium text-gray-900">32/50 (64%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Days Remaining</span>
                <span className="text-sm font-medium text-gray-900">15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}