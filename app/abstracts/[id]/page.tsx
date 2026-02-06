'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { abstractsApi, commentsApi } from '@/lib/api';
import type { Abstract, AbstractComment } from '@/lib/types';
import ChangelogModal from '@/components/ChangelogModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AbstractDetailPage() {
  const router = useRouter();
  const params = useParams();
  const abstractId = parseInt(params.id as string);

  const [abstract, setAbstract] = useState<Abstract | null>(null);
  const [comments, setComments] = useState<AbstractComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [changelogModalOpen, setChangelogModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveNote, setApproveNote] = useState('');
  const [approvePoints, setApprovePoints] = useState<number | ''>('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Check authentication
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/auth/login?role=reviewer');
      return;
    }

    const userData = JSON.parse(user);
    if (!userData.isStaff) {
      router.push('/');
      return;
    }

    // Set super admin status
    setIsSuperAdmin(userData.isSuperAdmin || false);

    fetchAbstractDetails();
    fetchComments();
  }, [router, abstractId]);

  const fetchAbstractDetails = async () => {
    setLoading(true);
    const response = await abstractsApi.getById(abstractId);

    if (response.data) {
      setAbstract(response.data);
      setError('');
    } else {
      setError('Abstract not found');
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const response = await commentsApi.getByAbstractId(abstractId);

    if (response.data && Array.isArray(response.data)) {
      setComments(response.data);
    }
  };

  const handleStatusUpdate = async (
    status: 'approved' | 'rejected' | 'more_info_requested',
  ) => {
    if (!abstract) return;

    // For approval, open the modal instead
    if (status === 'approved') {
      setApproveModalOpen(true);
      return;
    }

    const confirmMessages = {
      rejected: 'Are you sure you want to reject this abstract?',
      more_info_requested: 'Are you sure you want to request more information?',
    };

    if (!confirm(confirmMessages[status])) return;

    setActionLoading(true);
    let response;

    if (status === 'rejected') {
      response = await abstractsApi.reject(abstractId);
    } else {
      response = await abstractsApi.requestMoreInfo(abstractId);
    }

    if (response.data) {
      setAbstract(response.data);
      const statusLabel = status.replace(/_/g, ' ');
      alert(`Abstract ${statusLabel} successfully!`);
    } else {
      alert('Failed to update abstract status');
    }
    setActionLoading(false);
  };

  const handleApproveSubmit = async () => {
    if (!abstract) return;

    setActionLoading(true);
    const points = approvePoints === '' ? undefined : approvePoints;
    const response = await abstractsApi.approve(abstractId, approveNote || undefined, points);

    if (response.data) {
      setAbstract(response.data);
      alert('Abstract approved successfully!');
    } else {
      alert('Failed to approve abstract');
    }

    setApproveModalOpen(false);
    setApproveNote('');
    setApprovePoints('');
    setActionLoading(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    const response = await commentsApi.create(abstractId, newComment);

    if (response.data) {
      setComments([...comments, response.data]);
      setNewComment('');
    } else {
      alert('Failed to add comment');
    }
    setCommentLoading(false);
  };

  const getStatusBadge = (status: Abstract['status']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      more_info_requested: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const labels = {
      pending: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      more_info_requested: 'More Information Requested',
    };

    return (
      <span
        className={`px-4 py-2 rounded-full text-sm font-semibold border ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-gray-600">Loading abstract details...</div>
      </div>
    );
  }

  if (error || !abstract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-accent-red mb-4">
            {error || 'Abstract not found'}
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      <Header />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">

        {/* Status and Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Review Abstract
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(abstract.status)}
                {abstract.points != null && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {abstract.points} points
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Submitted on{' '}
                  {new Date(abstract.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isSuperAdmin && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={actionLoading || abstract.status === 'approved'}
                    className="px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={actionLoading || abstract.status === 'rejected'}
                    className="px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => handleStatusUpdate('more_info_requested')}
                disabled={
                  actionLoading || abstract.status === 'more_info_requested'
                }
                className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-[#3da0d4] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request More Info
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Abstract Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Abstract Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Title
                  </label>
                  <p className="text-gray-900">{abstract.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Sub-Theme Category
                  </label>
                  <p className="text-gray-900">{abstract.subThemeCategory}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Type of Presentation
                  </label>
                  <p className="text-gray-900">{abstract.presentationType}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Author Information
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {abstract.authorInformation}
                  </p>
                </div>
              </div>
            </div>

            {/* Presenter Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Presenter Details
              </h2>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Name:
                  </span>
                  <span className="col-span-2 text-gray-900">
                    {abstract.presenterFullName}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Email:
                  </span>
                  <span className="col-span-2 text-gray-900">
                    {abstract.presenterEmail}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Phone:
                  </span>
                  <span className="col-span-2 text-gray-900">
                    {abstract.presenterPhone}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Institution:
                  </span>
                  <span className="col-span-2 text-gray-900">
                    {abstract.presenterInstitution}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Country:
                  </span>
                  <span className="col-span-2 text-gray-900">
                    {abstract.presenterCountry}
                  </span>
                </div>
                {abstract.deanContact && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Dean Contact:
                    </span>
                    <span className="col-span-2 text-gray-900 whitespace-pre-wrap">
                      {abstract.deanContact}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Abstract Body */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Abstract Body
              </h2>
              <div
                className="prose prose-sm max-w-none text-gray-900"
                dangerouslySetInnerHTML={{ __html: abstract.abstractBody }}
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Comments</h2>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6">
                <textarea
                  rows={4}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentLoading ? 'Adding...' : 'Add Comment'}
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {!comments || comments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No comments yet
                  </p>
                ) : (
                  (comments || []).map((comment) => (
                    <div
                      key={comment.id}
                      className="border-l-4 border-primary-500 pl-3 py-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800">
                          {comment.submittedBy}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Changelog Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setChangelogModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            View Change History
          </button>
        </div>

        {/* Changelog Modal */}
        <ChangelogModal
          abstractId={abstractId}
          isOpen={changelogModalOpen}
          onClose={() => setChangelogModalOpen(false)}
        />

        {/* Approve Modal */}
        {approveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setApproveModalOpen(false)}
            />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Approve Abstract</h2>
                <button
                  onClick={() => setApproveModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade/Points (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={approvePoints}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setApprovePoints('');
                      } else {
                        const num = parseInt(val);
                        setApprovePoints(num > 10 ? 10 : num < 0 ? 0 : num);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter points (0-10)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add a note for this approval..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleApproveSubmit}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Approving...' : 'Confirm Approval'}
                  </button>
                  <button
                    onClick={() => setApproveModalOpen(false)}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
