'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import AppLayout from '@/components/AppLayout'
import type { StaffMember, StaffTopicAssignment } from '@/lib/types'

const SUB_THEME_CATEGORIES = [
  'Leadership, Governance, and African Ownership in Health Professions Education',
  'Transformative Technologies, AI, and Innovation in Medical Education',
  'Simulation-Based Education and Experiential Learning',
  'Partnerships for Health Workforce and Systems Strengthening',
  'Education for Impact: MNCH, Gender, and Sexual & Reproductive Health',
  'Learners at the Center: Assessment, Accreditation, Research, and Implementation for Change',
]

export default function ManageReviewersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    // Check authentication and super admin status
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userStr)

    // Verify user is super admin
    if (!user.isSuperAdmin) {
      router.push('/dashboard')
      return
    }

    fetchStaffMembers()
  }, [router])

  const fetchStaffMembers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await authApi.getAllStaff()
      console.log('Staff members response:', response)
      if (response.data) {
        // Ensure topicAssignments is always an array
        const staffWithTopics = response.data.map((staff) => ({
          ...staff,
          topicAssignments: staff.topicAssignments || [],
        }))
        console.log('Processed staff members:', staffWithTopics)
        setStaffMembers(staffWithTopics)
      } else {
        setError(response.message || 'Failed to load staff members')
      }
    } catch (err) {
      console.error('Error fetching staff:', err)
      setError('An error occurred while loading staff members')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenTopicModal = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setSelectedTopics(staff.topicAssignments.map((ta) => ta.topic))
    setShowTopicModal(true)
    setError('')
    setSuccess('')
  }

  const handleCloseTopicModal = () => {
    setShowTopicModal(false)
    setSelectedStaff(null)
    setSelectedTopics([])
  }

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const handleSaveTopics = async () => {
    if (!selectedStaff) return

    setActionLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('Saving topics for staff ID:', selectedStaff.id)
      console.log('Selected staff:', selectedStaff)

      const currentTopics = selectedStaff.topicAssignments.map((ta) => ta.topic)
      const topicsToAdd = selectedTopics.filter((t) => !currentTopics.includes(t))
      const topicsToRemove = currentTopics.filter((t) => !selectedTopics.includes(t))

      console.log('Topics to add:', topicsToAdd)
      console.log('Topics to remove:', topicsToRemove)

      // Add new topics
      const addPromises = topicsToAdd.map((topic) => {
        console.log(`Assigning topic "${topic}" to user ${selectedStaff.id}`)
        return authApi.assignStaffTopic(selectedStaff.id, topic)
      })

      // Remove topics
      const removePromises = topicsToRemove.map((topic) => {
        console.log(`Removing topic "${topic}" from user ${selectedStaff.id}`)
        return authApi.removeStaffTopic(selectedStaff.id, topic)
      })

      const results = await Promise.allSettled([...addPromises, ...removePromises])

      console.log('Assignment results:', results)

      const failed = results.filter((r) => r.status === 'rejected')

      if (failed.length > 0) {
        console.error('Failed operations:', failed)
        // Get error details from failed promises
        const errorMessages = failed.map((f: any) => f.reason?.message || 'Unknown error').join(', ')
        setError(
          `Some topic changes failed: ${errorMessages}. Please check if the staff member exists in the database.`
        )
      } else {
        setSuccess(
          `Topics updated successfully for ${selectedStaff.firstName} ${selectedStaff.lastName}`
        )
        await fetchStaffMembers()
        handleCloseTopicModal()
      }
    } catch (err) {
      console.error('Error in handleSaveTopics:', err)
      setError(`An error occurred while updating topics: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemoveTopic = async (staff: StaffMember, topic: string) => {
    if (!confirm(`Remove topic "${topic}" from ${staff.firstName} ${staff.lastName}?`)) {
      return
    }

    setActionLoading(true)
    setError('')
    setSuccess('')

    try {
      await authApi.removeStaffTopic(staff.id, topic)
      setSuccess(`Topic removed successfully`)
      await fetchStaffMembers()
    } catch (err) {
      setError('Failed to remove topic')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff members...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Reviewers
                </h1>
                <p className="text-gray-500 text-sm">
                  Assign and manage topic access for staff reviewers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-3">
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Staff List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Reviewer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned Topics
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staffMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  staffMembers.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                            {staff.firstName?.charAt(0)}
                            {staff.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {staff.firstName} {staff.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            staff.isSuperAdmin
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {staff.isSuperAdmin ? 'Super Admin' : 'Staff'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {staff.topicAssignments.length === 0 ? (
                          <span className="text-sm text-gray-400 italic">
                            No topics assigned
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {staff.topicAssignments.map((assignment) => (
                              <span
                                key={assignment.id}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                <span className="max-w-xs truncate">
                                  {assignment.topic}
                                </span>
                                <button
                                  onClick={() =>
                                    handleRemoveTopic(staff, assignment.topic)
                                  }
                                  disabled={actionLoading}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                  title="Remove topic"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenTopicModal(staff)}
                          disabled={actionLoading}
                          className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Manage Topics
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Topic Assignment Modal */}
      {showTopicModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Manage Topics
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedStaff.firstName} {selectedStaff.lastName}
                  </p>
                </div>
                <button
                  onClick={handleCloseTopicModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Select the topics this reviewer will have access to. They will only
                be able to view and review abstracts in their assigned topics.
              </p>
              <div className="space-y-2">
                {SUB_THEME_CATEGORIES.map((topic) => (
                  <label
                    key={topic}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic)}
                      onChange={() => handleTopicToggle(topic)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 flex-1">{topic}</span>
                  </label>
                ))}
              </div>
              {selectedTopics.length > 0 && (
                <p className="text-sm text-primary-600 mt-4 font-medium">
                  {selectedTopics.length} topic(s) selected
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={handleCloseTopicModal}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTopics}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
