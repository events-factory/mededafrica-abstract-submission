'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { abstractsApi, commentsApi } from '@/lib/api';
import type { Abstract, AbstractComment } from '@/lib/types';
import { mockAbstracts, mockComments } from '@/lib/mockData';
import ChangelogViewer from '@/components/ChangelogViewer';

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

    fetchAbstractDetails();
    fetchComments();
  }, [router, abstractId]);

  const fetchAbstractDetails = async () => {
    setLoading(true);
    const response = await abstractsApi.getById(abstractId);

    if (response.data) {
      setAbstract(response.data);
    } else {
      // Use mock data if API fails (Demo mode)
      const mockAbstract = mockAbstracts.find((a) => a.id === abstractId);
      if (mockAbstract) {
        console.log('API failed, using mock data for demo');
        setAbstract(mockAbstract);
        setError('');
      } else {
        setError('Abstract not found');
      }
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const response = await commentsApi.getByAbstractId(abstractId);

    if (response.data) {
      setComments(response.data);
    } else {
      // Use mock comments if API fails (Demo mode)
      const mockCommentsForAbstract = mockComments[abstractId] || [];
      setComments(mockCommentsForAbstract);
    }
  };

  const handleStatusUpdate = async (
    status: 'approved' | 'rejected' | 'more_info_requested',
  ) => {
    if (!abstract) return;

    const confirmMessages = {
      approved: 'Are you sure you want to approve this abstract?',
      rejected: 'Are you sure you want to reject this abstract?',
      more_info_requested: 'Are you sure you want to request more information?',
    };

    if (!confirm(confirmMessages[status])) return;

    setActionLoading(true);
    let response;

    if (status === 'approved') {
      response = await abstractsApi.approve(abstractId);
    } else if (status === 'rejected') {
      response = await abstractsApi.reject(abstractId);
    } else {
      response = await abstractsApi.requestMoreInfo(abstractId);
    }

    if (response.data) {
      setAbstract(response.data);
      const statusLabel = status.replace(/_/g, ' ');
      alert(`Abstract ${statusLabel} successfully!`);
    } else {
      // Demo mode: Update status locally
      console.log('API failed, updating status locally for demo');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedAbstract = {
        ...abstract,
        status,
        reviewedBy: user.email || 'demo-reviewer@example.com',
        reviewedAt: new Date().toISOString(),
      };
      setAbstract(updatedAbstract);
      const statusLabel = status.replace(/_/g, ' ');
      alert(`Abstract ${statusLabel} successfully! (Demo Mode)`);
    }
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
      // Demo mode: Add comment locally
      console.log('API failed, adding comment locally for demo');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const mockComment: AbstractComment = {
        id: Date.now(),
        abstractId,
        comment: newComment,
        submittedBy: user.email || 'demo-reviewer@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setComments([...comments, mockComment]);
      setNewComment('');
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Status and Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Review Abstract
              </h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(abstract.status)}
                <span className="text-sm text-gray-500">
                  Submitted on{' '}
                  {new Date(abstract.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={actionLoading || abstract.status === 'approved'}
                className="px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate('more_info_requested')}
                disabled={
                  actionLoading || abstract.status === 'more_info_requested'
                }
                className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-[#3da0d4] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request More Info
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={actionLoading || abstract.status === 'rejected'}
                className="px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
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
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No comments yet
                  </p>
                ) : (
                  comments.map((comment) => (
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

        {/* Change History Section - Full Width */}
        <div className="mt-8">
          <ChangelogViewer abstractId={abstractId} />
        </div>
      </div>
    </div>
  );
}
