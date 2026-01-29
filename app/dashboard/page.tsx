'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { abstractsApi } from '@/lib/api';
import type { Abstract } from '@/lib/types';
import { mockAbstracts } from '@/lib/mockData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  const router = useRouter();
  const [abstracts, setAbstracts] = useState<Abstract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'more_info_requested'
  >('all');

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

    fetchAbstracts();
  }, [router]);

  const fetchAbstracts = async () => {
    setLoading(true);
    const response = await abstractsApi.getAll();

    if (response.data) {
      setAbstracts(response.data);
    } else {
      // Use mock data if API fails (Demo mode)
      console.log('API failed, using mock data for demo');
      setAbstracts(mockAbstracts);
      setError('');
    }
    setLoading(false);
  };

  const getStatusBadge = (status: Abstract['status']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      more_info_requested: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      more_info_requested: 'More Info Requested',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const filteredAbstracts =
    filter === 'all'
      ? abstracts
      : abstracts.filter((abstract) => abstract.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pb-8 px-4">
      <Header />
      <div className="max-w-7xl mx-auto mt-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div>
              <h1 className="text-3xl font-bold text-primary-700">
                Abstract Review Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Review and manage submitted abstracts
              </p>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({abstracts.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({abstracts.filter((a) => a.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved (
              {abstracts.filter((a) => a.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected (
              {abstracts.filter((a) => a.status === 'rejected').length})
            </button>
            <button
              onClick={() => setFilter('more_info_requested')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'more_info_requested'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              More Info Requested (
              {abstracts.filter((a) => a.status === 'more_info_requested').length})
            </button>
          </div>
        </div>

        {/* Abstracts Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading abstracts...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-accent-red">{error}</div>
          ) : filteredAbstracts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No abstracts found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-500 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Presenter
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAbstracts.map((abstract) => (
                    <tr key={abstract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {abstract.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {abstract.presenterFullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {abstract.presenterEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 max-w-xs truncate">
                          {abstract.subThemeCategory}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(abstract.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(abstract.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/abstracts/${abstract.id}`}
                          className="inline-block px-4 py-2 bg-primary-light text-white text-sm rounded-lg hover:bg-[#3da0d4] transition-colors font-medium"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
