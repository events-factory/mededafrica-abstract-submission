'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { abstractsApi } from '@/lib/api';
import type { Abstract } from '@/lib/types';
import AppLayout from '@/components/AppLayout';

const PAGE_SIZE = 25;

type ReviewStats = { avg: number; count: number };

export default function DashboardPage() {
  const router = useRouter();
  const [abstracts, setAbstracts] = useState<Abstract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'more_info_requested'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewStats, setReviewStats] = useState<Map<number, ReviewStats>>(new Map());
  const [search, setSearch] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/auth/login?role=reviewer');
      return;
    }

    const userData = JSON.parse(user);
    if (!userData.isStaff && !userData.isSuperAdmin) {
      router.push('/');
      return;
    }

    fetchAbstracts();
  }, [router]);

  const fetchAbstracts = async () => {
    setLoading(true);
    const response = await abstractsApi.getAll();

    if (response.data && Array.isArray(response.data)) {
      setAbstracts(response.data);
      setError('');
    } else {
      setError('Failed to load abstracts');
    }
    setLoading(false);
  };

  // Fetch reviewer stats only for the abstracts visible on the current page.
  // Results are cached in reviewStats so navigating back never re-fetches.
  const fetchPageReviewStats = async (pageAbstracts: Abstract[]) => {
    const uncached = pageAbstracts.filter((a) => !reviewStats.has(a.id));
    if (uncached.length === 0) return;

    await Promise.allSettled(
      uncached.map(async (a) => {
        const res = await abstractsApi.getReviews(a.id);
        if (res.data && res.data.reviewCount > 0) {
          setReviewStats((prev) => {
            const next = new Map(prev);
            next.set(a.id, {
              avg: Math.round(
                res.data.reviews.reduce((s, r) => s + r.totalScore, 0) / res.data.reviews.length,
              ),
              count: res.data.reviewCount,
            });
            return next;
          });
        }
      }),
    );
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

  const safeAbstracts = abstracts || [];
  const q = search.trim().toLowerCase();
  const filteredAbstracts = safeAbstracts.filter((a) => {
    const matchesStatus = filter === 'all' || a.status === filter;
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.presenterFullName.toLowerCase().includes(q) ||
      a.presenterEmail.toLowerCase().includes(q) ||
      a.subThemeCategory.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAbstracts.length / PAGE_SIZE));
  const pagedAbstracts = filteredAbstracts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Fetch reviewer stats for the current page whenever it changes.
  useEffect(() => {
    if (abstracts.length === 0) return;
    const q2 = search.trim().toLowerCase();
    const visible = abstracts
      .filter((a) => {
        const matchesStatus = filter === 'all' || a.status === filter;
        const matchesSearch =
          !q2 ||
          a.title.toLowerCase().includes(q2) ||
          a.presenterFullName.toLowerCase().includes(q2) ||
          a.presenterEmail.toLowerCase().includes(q2) ||
          a.subThemeCategory.toLowerCase().includes(q2);
        return matchesStatus && matchesSearch;
      })
      .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    fetchPageReviewStats(visible);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abstracts, filter, search, currentPage]);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const exportToExcel = () => {
    const rows = filteredAbstracts.map((a) => ({
      ID: a.id,
      Title: a.title,
      'Presenter Name': a.presenterFullName,
      'Presenter Email': a.presenterEmail,
      'Presenter Phone': a.presenterPhone,
      'Presenter Institution': a.presenterInstitution,
      'Presenter Country': a.presenterCountry,
      'Presenter Gender': a.presenterGender,
      'Professional Status': a.professionalStatus,
      Category: a.subThemeCategory,
      'Presentation Type': a.presentationType,
      Status: a.status,
      Points: a.points ?? '',
      'Review Note': a.reviewNote ?? '',
      'Reviewed By': a.reviewedBy ?? '',
      'Reviewed At': a.reviewedAt ? new Date(a.reviewedAt).toLocaleDateString() : '',
      'Submitted At': new Date(a.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Abstracts');

    const filename = `abstracts-${filter}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Abstract Review Dashboard</h1>
              <p className="text-gray-500 text-sm">Review and manage submitted abstracts</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({safeAbstracts.length})
            </button>
            <button
              onClick={() => handleFilterChange('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({safeAbstracts.filter((a) => a.status === 'pending').length})
            </button>
            <button
              onClick={() => handleFilterChange('approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'approved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved (
              {safeAbstracts.filter((a) => a.status === 'approved').length})
            </button>
            <button
              onClick={() => handleFilterChange('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected (
              {safeAbstracts.filter((a) => a.status === 'rejected').length})
            </button>
            <button
              onClick={() => handleFilterChange('more_info_requested')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'more_info_requested'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              More Info Requested (
              {safeAbstracts.filter((a) => a.status === 'more_info_requested').length})
            </button>
          </div>
          <button
            onClick={exportToExcel}
            disabled={filteredAbstracts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel ({filteredAbstracts.length})
          </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm px-4 py-3 mb-4">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, presenter, or category…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {q && (
            <p className="text-xs text-gray-500 mt-2">
              {filteredAbstracts.length} result{filteredAbstracts.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </p>
          )}
        </div>

        {/* Abstracts Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                      Points
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
                  {pagedAbstracts.map((abstract) => (
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
                        {(() => {
                          const rs = reviewStats.get(abstract.id);
                          const hasReviewer = rs && rs.count > 0;
                          const hasSC = abstract.points != null && abstract.points > 0;
                          const hasBonus = abstract.equityPoints != null && abstract.equityPoints > 0;
                          if (!hasReviewer && !hasSC && !hasBonus) return <span className="text-gray-400">-</span>;
                          return (
                            <div className="flex flex-col gap-0.5">
                              {hasReviewer && (
                                <span className="font-semibold text-primary-600">
                                  {rs!.avg}<span className="font-normal text-gray-400">/30</span>
                                  <span className="text-xs text-gray-400 ml-1">({rs!.count})</span>
                                </span>
                              )}
                              {hasSC && (
                                <span className="text-xs text-blue-600 font-medium">SC: {abstract.points}/100</span>
                              )}
                              {hasBonus && (
                                <span className="text-xs text-purple-600 font-medium">+{abstract.equityPoints} bonus</span>
                              )}
                            </div>
                          );
                        })()}
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
          {/* Pagination */}
          {!loading && !error && filteredAbstracts.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredAbstracts.length)} of {filteredAbstracts.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .reduce<(number | '…')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (arr[idx - 1] as number) + 1 < p) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '…' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item as number)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          currentPage === item
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 rounded text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
