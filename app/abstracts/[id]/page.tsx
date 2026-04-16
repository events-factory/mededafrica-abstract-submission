'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { abstractsApi, commentsApi } from '@/lib/api';
import type {
  Abstract,
  AbstractComment,
  ReviewsSummary,
  BonusPointsPayload,
} from '@/lib/types';
import ChangelogModal from '@/components/ChangelogModal';
import AppLayout from '@/components/AppLayout';

// Section A: 9-criteria scientific merit scoring (max 100)
const REVIEW_CRITERIA = [
  { key: 'titleClarity',     label: 'Title Clarity',     max: 5,  description: 'Title is clear and accurately reflects the content' },
  { key: 'structuredFormat', label: 'Structured Format', max: 10, description: 'Abstract follows a structured format (background, methods, results, conclusion)' },
  { key: 'relevance',        label: 'Relevance',         max: 15, description: 'Topic is relevant to the conference themes' },
  { key: 'methodology',      label: 'Methodology',       max: 20, description: 'Research methodology is sound and well-described' },
  { key: 'dataQuality',      label: 'Data Quality',      max: 15, description: 'Data is accurate and appropriately analyzed' },
  { key: 'conclusions',      label: 'Conclusions',       max: 10, description: 'Conclusions are supported by the results' },
  { key: 'originality',      label: 'Originality',       max: 10, description: 'Work presents novel ideas or findings' },
  { key: 'contribution',     label: 'Contribution',      max: 10, description: 'Contributes meaningfully to the field' },
  { key: 'overallMerit',     label: 'Overall Merit',     max: 5,  description: 'Overall quality of the abstract' },
] as const;

type ReviewKey = typeof REVIEW_CRITERIA[number]['key'];
type ReviewScores = Record<ReviewKey, number>;

const INITIAL_SCORES: ReviewScores = {
  titleClarity: 0, structuredFormat: 0, relevance: 0, methodology: 0,
  dataQuality: 0, conclusions: 0, originality: 0, contribution: 0, overallMerit: 0,
};

// Section B: auto-computed recommendation thresholds
function getRecommendation(total: number): { label: string; color: string; bg: string } {
  if (total >= 85) return { label: 'Accept — Oral Presentation (Podium)', color: 'text-green-800', bg: 'bg-green-100 border-green-300' };
  if (total >= 70) return { label: 'Accept — Poster Presentation',        color: 'text-blue-800',  bg: 'bg-blue-100 border-blue-300'  };
  if (total > 0)   return { label: 'Not Accepted',                        color: 'text-red-800',   bg: 'bg-red-100 border-red-300'    };
  return             { label: '—',                                        color: 'text-gray-500',  bg: 'bg-gray-50 border-gray-200'   };
}

// Sections C & D: Bonus point categories
const GEO_BONUS_CRITERIA = [
  { key: 'geoBonusUnderrepresentedRegion' as const, label: 'Underrepresented African Region',   max: 5 },
  { key: 'geoBonusLMIC'                   as const, label: 'Low/Middle-Income Country',          max: 3 },
  { key: 'geoBonusFirstTimeInstitution'   as const, label: 'First-time Submitting Institution',  max: 2 },
];

const EQUITY_BONUS_CRITERIA = [
  { key: 'equityBonusUnderrepresentedGender' as const, label: 'Lead Author Underrepresented Gender', max: 5 },
  { key: 'equityBonusMemberUniversity'       as const, label: 'Member University (COMS-A)',           max: 5 },
  { key: 'equityBonusPartnerInstitution'     as const, label: 'Associate Partner Institution',        max: 3 },
];

const INITIAL_BONUS: BonusPointsPayload = {
  geoBonusUnderrepresentedRegion: 0,
  geoBonusLMIC: 0,
  geoBonusFirstTimeInstitution: 0,
  equityBonusUnderrepresentedGender: 0,
  equityBonusMemberUniversity: 0,
  equityBonusPartnerInstitution: 0,
  note: '',
};

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Section A: review form state
  const [reviewScores, setReviewScores] = useState<ReviewScores>({ ...INITIAL_SCORES });
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ReviewsSummary | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Sections C & D: bonus points state
  const [bonusData, setBonusData] = useState<BonusPointsPayload>({ ...INITIAL_BONUS });
  const [bonusLoading, setBonusLoading] = useState(false);

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
    setIsSuperAdmin(userData.isSuperAdmin || false);
    fetchAbstractDetails();
    fetchComments();
    fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abstractId]);

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

  const fetchReviews = async () => {
    setReviewsLoading(true);
    const response = await abstractsApi.getReviews(abstractId);
    if (response.data) {
      setReviewSummary(response.data);
    }
    setReviewsLoading(false);
  };

  const handleStatusUpdate = async (
    status: 'approved' | 'rejected' | 'more_info_requested',
  ) => {
    if (!abstract) return;
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
    const response =
      status === 'rejected'
        ? await abstractsApi.reject(abstractId)
        : await abstractsApi.requestMoreInfo(abstractId);
    if (response.data) {
      setAbstract(response.data);
      alert(`Abstract ${status.replace(/_/g, ' ')} successfully!`);
    } else {
      alert('Failed to update abstract status');
    }
    setActionLoading(false);
  };

  const handleApproveSubmit = async () => {
    if (!abstract) return;
    setActionLoading(true);
    const response = await abstractsApi.approve(abstractId, approveNote || undefined);
    if (response.data) {
      setAbstract(response.data);
      alert('Abstract approved successfully!');
    } else {
      alert('Failed to approve abstract');
    }
    setApproveModalOpen(false);
    setApproveNote('');
    setActionLoading(false);
  };

  const handleSubmitReview = async () => {
    const allScored = REVIEW_CRITERIA.every(c => reviewScores[c.key] > 0);
    if (!allScored) {
      alert('Please score all criteria before submitting.');
      return;
    }
    setReviewLoading(true);
    const response = await abstractsApi.submitReview(abstractId, {
      ...reviewScores,
      comment: reviewComment || undefined,
    });
    if (response.data) {
      setReviewScores({ ...INITIAL_SCORES });
      setReviewComment('');
      await fetchReviews();
      alert('Review submitted successfully!');
    } else {
      alert('Failed to submit review');
    }
    setReviewLoading(false);
  };

  const handleUpdateBonusPoints = async () => {
    if (!reviewSummary?.meetsMinimumThreshold) {
      alert('Cannot assign bonus points: average scientific merit is below 70.');
      return;
    }
    setBonusLoading(true);
    const response = await abstractsApi.updateBonusPoints(abstractId, {
      ...bonusData,
      note: bonusData.note || undefined,
    });
    if (response.data) {
      setAbstract(response.data);
      alert('Bonus points updated successfully!');
    } else {
      alert('Failed to update bonus points');
    }
    setBonusLoading(false);
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
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Live totals for the review form
  const reviewTotal = Object.values(reviewScores).reduce((sum, v) => sum + v, 0);
  const reviewRec = getRecommendation(reviewTotal);
  const allScored = REVIEW_CRITERIA.every(c => reviewScores[c.key] > 0);

  const bonusTotal =
    bonusData.geoBonusUnderrepresentedRegion +
    bonusData.geoBonusLMIC +
    bonusData.geoBonusFirstTimeInstitution +
    bonusData.equityBonusUnderrepresentedGender +
    bonusData.equityBonusMemberUniversity +
    bonusData.equityBonusPartnerInstitution;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-600">Loading abstract details...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !abstract) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center px-4 py-20">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
            <div className="text-accent-red mb-4">{error || 'Abstract not found'}</div>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Status and Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Review Abstract</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusBadge(abstract.status)}
                  {abstract.equityPoints != null && abstract.equityPoints > 0 && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      +{abstract.equityPoints} bonus pts
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    Submitted on {new Date(abstract.createdAt).toLocaleDateString()}
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
                  disabled={actionLoading || abstract.status === 'more_info_requested'}
                  className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-[#3da0d4] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request More Info
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Abstract Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Abstract Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                    <p className="text-gray-900">{abstract.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Theme Category</label>
                    <p className="text-gray-900">{abstract.subThemeCategory}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type of Presentation</label>
                    <p className="text-gray-900">{abstract.presentationType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Author Information</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{abstract.authorInformation}</p>
                  </div>
                </div>
              </div>

              {/* Presenter Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Presenter Details</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Name:',                value: abstract.presenterFullName },
                    { label: 'Email:',               value: abstract.presenterEmail },
                    { label: 'Phone:',               value: abstract.presenterPhone },
                    { label: 'Institution:',         value: abstract.presenterInstitution },
                    { label: 'Country:',             value: abstract.presenterCountry },
                    { label: 'Gender:',              value: abstract.presenterGender },
                    { label: 'Professional Status:', value: abstract.professionalStatus },
                  ].map(({ label, value }) => (
                    <div key={label} className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-gray-700">{label}</span>
                      <span className="col-span-2 text-gray-900">{value}</span>
                    </div>
                  ))}
                  {abstract.deanContact && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-gray-700">Dean Contact:</span>
                      <span className="col-span-2 text-gray-900 whitespace-pre-wrap">{abstract.deanContact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Abstract Body */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Abstract Body</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-900"
                  dangerouslySetInnerHTML={{ __html: abstract.abstractBody }}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-1 space-y-6">

              {/* Section A: Scientific Merit Review Form */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Section A — Scientific Merit</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Score each criterion. Total: 100 pts.</p>
                </div>

                <div className="space-y-3">
                  {REVIEW_CRITERIA.map(c => (
                    <div key={c.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">{c.label}</span>
                        <span className="text-xs font-mono text-gray-500">
                          <span className={reviewScores[c.key] > 0 ? 'text-[#1a3a5c] font-bold' : ''}>
                            {reviewScores[c.key]}
                          </span>
                          /{c.max}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={c.max}
                        value={reviewScores[c.key]}
                        onChange={e =>
                          setReviewScores(prev => ({ ...prev, [c.key]: parseInt(e.target.value) }))
                        }
                        className="w-full h-1.5 rounded-full accent-[#1a3a5c] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                {/* Live score + Section B recommendation */}
                <div className={`mt-4 rounded-lg border px-3 py-2.5 flex items-center justify-between ${reviewRec.bg}`}>
                  <div>
                    <p className={`text-xs font-semibold ${reviewRec.color}`}>Recommendation</p>
                    <p className={`text-xs mt-0.5 ${reviewRec.color}`}>{reviewRec.label}</p>
                  </div>
                  <p className={`text-2xl font-black ${reviewRec.color}`}>
                    {reviewTotal}
                    <span className="text-sm font-semibold opacity-60">/100</span>
                  </p>
                </div>

                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Review comment (optional)..."
                  className="mt-3 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent resize-none"
                />

                <button
                  onClick={handleSubmitReview}
                  disabled={reviewLoading || !allScored}
                  className="mt-3 w-full px-4 py-2 bg-[#1a3a5c] text-white rounded-lg hover:bg-[#25527f] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
                {!allScored && (
                  <p className="mt-1.5 text-xs text-amber-600 text-center">
                    Score all criteria to submit
                  </p>
                )}
              </div>

              {/* Reviews Summary */}
              {reviewsLoading ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-sm text-gray-500">
                  Loading reviews...
                </div>
              ) : reviewSummary && reviewSummary.reviewCount > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-3">Review Summary</h2>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        {reviewSummary.reviewCount} review{reviewSummary.reviewCount !== 1 ? 's' : ''}
                      </p>
                      {(() => {
                        const avg = Math.round(reviewSummary.averageScientificMerit);
                        const rec = getRecommendation(avg);
                        return (
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold border ${rec.bg} ${rec.color}`}>
                            {rec.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-black ${reviewSummary.meetsMinimumThreshold ? 'text-green-700' : 'text-red-600'}`}>
                        {Math.round(reviewSummary.averageScientificMerit)}
                        <span className="text-sm font-semibold opacity-60">/100</span>
                      </p>
                      <p className={`text-xs mt-0.5 font-medium ${reviewSummary.meetsMinimumThreshold ? 'text-green-600' : 'text-red-500'}`}>
                        {reviewSummary.meetsMinimumThreshold ? 'Meets threshold' : 'Below minimum (70)'}
                      </p>
                    </div>
                  </div>

                  {/* Per-reviewer breakdown */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {reviewSummary.reviews.map((r, i) => (
                      <div key={r.id} className="border border-gray-100 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 font-medium">Reviewer {i + 1}</span>
                          <span className="text-xs font-bold text-[#1a3a5c]">{r.totalScore}/100</span>
                        </div>
                        {r.comment && (
                          <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{r.comment}&rdquo;</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Sections C & D: Bonus Points — Super Admin only */}
              {isSuperAdmin && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Sections C & D — Bonus Points</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Super admin only. Requires avg scientific merit ≥ 70.</p>
                  </div>

                  {!reviewSummary?.meetsMinimumThreshold ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-700">
                      Bonus points cannot be assigned until the average scientific merit meets the minimum threshold of 70/100.
                    </div>
                  ) : (
                    <>
                      {/* Section C: Geographical */}
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                          Section C — Geographical (max 10)
                        </p>
                        {GEO_BONUS_CRITERIA.map(b => (
                          <div key={b.key} className="mb-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-700">{b.label}</span>
                              <span className="text-xs font-mono font-bold text-[#1a3a5c]">
                                {bonusData[b.key]}/{b.max}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={b.max}
                              value={bonusData[b.key]}
                              onChange={e =>
                                setBonusData(prev => ({ ...prev, [b.key]: parseInt(e.target.value) }))
                              }
                              className="w-full h-1.5 rounded-full accent-purple-600 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Section D: Equity & Membership */}
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                          Section D — Equity & Membership (max 10)
                        </p>
                        {EQUITY_BONUS_CRITERIA.map(b => (
                          <div key={b.key} className="mb-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-700">{b.label}</span>
                              <span className="text-xs font-mono font-bold text-[#1a3a5c]">
                                {bonusData[b.key]}/{b.max}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={b.max}
                              value={bonusData[b.key]}
                              onChange={e =>
                                setBonusData(prev => ({ ...prev, [b.key]: parseInt(e.target.value) }))
                              }
                              className="w-full h-1.5 rounded-full accent-purple-600 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Bonus total */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-purple-700">Total Bonus</span>
                        <span className="text-xl font-black text-purple-700">
                          {bonusTotal}
                          <span className="text-sm font-semibold opacity-60">/20</span>
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        value={bonusData.note || ''}
                        onChange={e => setBonusData(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="Note (optional)..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none mb-3"
                      />

                      <button
                        onClick={handleUpdateBonusPoints}
                        disabled={bonusLoading}
                        className="w-full px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {bonusLoading ? 'Saving...' : 'Save Bonus Points'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Comments Section */}
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Comments</h2>

                <form onSubmit={handleAddComment} className="mb-6">
                  <textarea
                    rows={4}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !newComment.trim()}
                    className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commentLoading ? 'Adding...' : 'Add Comment'}
                  </button>
                </form>

                <div className="space-y-4">
                  {!comments || comments.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="border-l-4 border-primary-500 pl-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">{comment.submittedBy}</span>
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

          {/* View Changelog */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setChangelogModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Change History
            </button>
          </div>

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
              <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Confirm Approval</h2>
                  {reviewSummary && reviewSummary.reviewCount > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Avg. scientific merit:{' '}
                      <strong>{Math.round(reviewSummary.averageScientificMerit)}/100</strong>
                      {' '}— {getRecommendation(Math.round(reviewSummary.averageScientificMerit)).label}
                    </p>
                  )}
                </div>
                <div className="p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Note <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={approveNote}
                    onChange={e => setApproveNote(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Add any notes about this approval decision..."
                  />
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-xl">
                  <button
                    onClick={handleApproveSubmit}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-accent-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
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
          )}
        </div>
      </div>
    </AppLayout>
  );
}
