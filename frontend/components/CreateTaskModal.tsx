'use client'

import { useState, useEffect } from 'react'
import { createTask } from '../lib/queries'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApplications } from '../lib/queries'
import { X, Calendar, User, FileText, AlertCircle, Phone, Mail, Eye } from 'lucide-react'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const queryClient = useQueryClient()
  const [taskData, setTaskData] = useState({
    related_id: '',
    type: 'call' as 'call' | 'email' | 'review',
    title: '',
    description: '',
    due_at: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assigned_to: '',
  })

  // Fetch applications for dropdown
  const { data: applicationsData } = useQuery({
    queryKey: ['applicationsForTask'],
    queryFn: () => fetchApplications({ limit: 50 }),
  })

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayTasks'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      onClose()
      setTaskData({
        related_id: '',
        type: 'call',
        title: '',
        description: '',
        due_at: '',
        priority: 'medium',
        assigned_to: '',
      })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate due date is in the future
    if (new Date(taskData.due_at) <= new Date()) {
      alert('Due date must be in the future')
      return
    }

    // Validate required fields
    if (!taskData.related_id || !taskData.title || !taskData.due_at) {
      alert('Please fill in all required fields')
      return
    }

    await createTaskMutation.mutateAsync(taskData)
  }

  // Set default due date to tomorrow
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(14, 0, 0, 0) // Set to 2 PM tomorrow
      
      setTaskData(prev => ({
        ...prev,
        due_at: tomorrow.toISOString().slice(0, 16)
      }))
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Application Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Application *
              </label>
              <select
                required
                value={taskData.related_id}
                onChange={(e) => setTaskData({ ...taskData, related_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose an application...</option>
                {applicationsData?.applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.leads?.first_name} {app.leads?.last_name} - {app.program}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTaskData({ ...taskData, type: 'call', title: 'Follow-up Call' })}
                  className={`px-4 py-3 rounded-lg border flex flex-col items-center justify-center ${
                    taskData.type === 'call'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Phone className="w-5 h-5 mb-1" />
                  <span className="text-sm">Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTaskData({ ...taskData, type: 'email', title: 'Send Email' })}
                  className={`px-4 py-3 rounded-lg border flex flex-col items-center justify-center ${
                    taskData.type === 'email'
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="w-5 h-5 mb-1" />
                  <span className="text-sm">Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTaskData({ ...taskData, type: 'review', title: 'Review Application' })}
                  className={`px-4 py-3 rounded-lg border flex flex-col items-center justify-center ${
                    taskData.type === 'review'
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-5 h-5 mb-1" />
                  <span className="text-sm">Review</span>
                </button>
              </div>
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                placeholder="e.g., Follow-up call, Send documents, Review application"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                rows={3}
                placeholder="Add details about the task..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date & Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="datetime-local"
                    required
                    value={taskData.due_at}
                    onChange={(e) => setTaskData({ ...taskData, due_at: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  required
                  value={taskData.priority}
                  onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            {/* Assign To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={taskData.assigned_to}
                  onChange={(e) => setTaskData({ ...taskData, assigned_to: e.target.value })}
                  placeholder="Enter counselor name or email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Validation */}
            {taskData.due_at && new Date(taskData.due_at) <= new Date() && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">Due date must be in the future</p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createTaskMutation.isPending || (taskData.due_at && new Date(taskData.due_at) <= new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}