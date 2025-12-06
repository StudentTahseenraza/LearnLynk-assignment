'use client'

import { Task } from '../lib/queries'
import { format } from 'date-fns'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface TasksTableProps {
  tasks: Task[]
  onMarkComplete: (taskId: string) => Promise<void>
  isLoading?: boolean
}

export default function TasksTable({ tasks, onMarkComplete, isLoading = false }: TasksTableProps) {
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMarkComplete = async (taskId: string) => {
    try {
      setCompletingTaskId(taskId)
      setError(null)
      await onMarkComplete(taskId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark task as complete')
    } finally {
      setCompletingTaskId(null)
    }
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTaskTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'call':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'email':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'review':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, 'MMM d, yyyy h:mm a')
    } catch {
      return 'Invalid date'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks due today!</h3>
        <p className="text-gray-500">All caught up. Enjoy your day!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Application
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTaskTypeColor(task.type)} mr-3`}>
                      {task.type}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    App ID: {task.related_id.substring(0, 8)}...
                  </div>
                  {task.applications?.leads && (
                    <div className="text-sm text-gray-500">
                      Lead: {task.applications.leads.first_name} {task.applications.leads.last_name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDateTime(task.due_at)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(task.due_at) < new Date() ? 'Overdue' : 'Upcoming'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(task.status)}
                    <span className="ml-2 text-sm text-gray-900 capitalize">{task.status.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleMarkComplete(task.id)}
                      disabled={completingTaskId === task.id}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                        completingTaskId === task.id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                      }`}
                    >
                      {completingTaskId === task.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Completing...
                        </>
                      ) : (
                        'Mark Complete'
                      )}
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <span className="text-green-600 font-medium">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{tasks.length}</span> tasks due today
          </div>
          <div className="flex space-x-4">
            <div className="text-sm">
              <span className="font-medium text-green-600">
                {tasks.filter(t => t.status === 'completed').length}
              </span>{' '}
              completed
            </div>
            <div className="text-sm">
              <span className="font-medium text-yellow-600">
                {tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length}
              </span>{' '}
              pending
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}