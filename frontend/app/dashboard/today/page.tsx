'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTodayTasks, markTaskComplete, createDemoTask } from '../../../lib/queries'
import TasksTable from '../../../components/TasksTable'
import { Calendar, CheckCircle, AlertCircle, RefreshCw, Clock, Plus } from 'lucide-react'
import { useState } from 'react'

function TodayTasksContent() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  // Fetch today's tasks
  const {
    data: tasksData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['todayTasks'],
    queryFn: fetchTodayTasks,
    refetchOnWindowFocus: false,
  })

  // Mutation for marking task as complete
  const completeMutation = useMutation({
    mutationFn: markTaskComplete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] })
    },
  })

  // Mutation for creating demo task
  const demoMutation = useMutation({
    mutationFn: createDemoTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })

  const handleMarkComplete = async (taskId: string) => {
    await completeMutation.mutateAsync(taskId)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleCreateDemo = async () => {
    try {
      await demoMutation.mutateAsync()
    } catch (err) {
      console.error('Failed to create demo:', err)
    }
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow p-8">
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Today&apos;s Tasks</h1>
            <div className="flex items-center mt-2 text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{getTodayDate()}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateDemo}
              disabled={demoMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all"
            >
              <Plus className={`w-4 h-4 mr-2 ${demoMutation.isPending ? 'animate-spin' : ''}`} />
              {demoMutation.isPending ? 'Creating Demo...' : 'Create Demo Task'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tasks Today</p>
                <p className="text-2xl font-bold text-gray-900">{tasksData?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{tasksData?.completed || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{tasksData?.pending || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Error Loading Tasks</h3>
              <p className="text-red-700 mt-1">{error?.message || 'Unknown error occurred'}</p>
              <div className="mt-4">
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow-lg animate-slideIn">
        <TasksTable
          tasks={tasksData?.tasks || []}
          onMarkComplete={handleMarkComplete}
          isLoading={isLoading}
        />
      </div>

      {/* Empty State */}
      {tasksData?.total === 0 && !isError && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-blue-900 mb-2">No tasks due today</h3>
            <p className="text-blue-700 mb-4">
              You're all caught up! Create a new task or check upcoming tasks.
            </p>
            <button
              onClick={handleCreateDemo}
              disabled={demoMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Demo Task
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TodayTasksPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <TodayTasksContent />
      </div>
    </div>
  )
}