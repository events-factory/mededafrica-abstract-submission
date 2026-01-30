import { User, Abstract, AbstractComment, AbstractCoauthor, AbstractHistory, Changelog, ApiResponse } from './types'

// Use local proxy to avoid CORS issues
const API_BASE_URL = '/api/proxy'

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        message: data.message || 'Request failed',
        data: data.data as T,
      }
    }

    return {
      message: data.message,
      data: data.data as T,
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Network error',
      data: {} as T,
    }
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phoneNumber?: string
    companyName?: string
    address?: string
    city?: string
    country?: string
    eventName?: string
    expectedAttendees?: number
    neededServices?: string
    comments?: string
    profilePicture?: string
  }) => {
    return apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  getProfile: async () => {
    return apiRequest<User>('/auth/profile', {
      method: 'GET',
    })
  },

  updateProfile: async (userData: Partial<User>) => {
    return apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  },

  inviteStaff: async (staffData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => {
    return apiRequest<User>('/auth/invite-staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },
}

// Abstracts API
export const abstractsApi = {
  create: async (abstractData: Omit<Abstract, 'id' | 'submittedBy' | 'status' | 'createdAt' | 'updatedAt' | 'reviewNote' | 'reviewedBy' | 'reviewedAt'>) => {
    return apiRequest<Abstract>('/abstracts', {
      method: 'POST',
      body: JSON.stringify(abstractData),
    })
  },

  getAll: async () => {
    return apiRequest<Abstract[]>('/abstracts', {
      method: 'GET',
    })
  },

  getById: async (id: number) => {
    return apiRequest<Abstract>(`/abstracts/${id}`, {
      method: 'GET',
    })
  },

  update: async (id: number, abstractData: Partial<Abstract>) => {
    return apiRequest<Abstract>(`/abstracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(abstractData),
    })
  },

  delete: async (id: number) => {
    return apiRequest<void>(`/abstracts/${id}`, {
      method: 'DELETE',
    })
  },

  approve: async (id: number, note?: string, points?: number) => {
    return apiRequest<Abstract>(`/abstracts/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ note, points }),
    })
  },

  reject: async (id: number, note?: string) => {
    return apiRequest<Abstract>(`/abstracts/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    })
  },

  requestMoreInfo: async (id: number, note?: string) => {
    return apiRequest<Abstract>(`/abstracts/${id}/request-more-info`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    })
  },

  getHistory: async (id: number) => {
    return apiRequest<AbstractHistory[]>(`/abstracts/${id}/history`, {
      method: 'GET',
    })
  },

  getChangelog: async (id: number) => {
    return apiRequest<Changelog>(`/abstracts/${id}/changelog`, {
      method: 'GET',
    })
  },
}

// Comments API
export const commentsApi = {
  create: async (abstractId: number, comment: string) => {
    return apiRequest<AbstractComment>('/abstract-comments', {
      method: 'POST',
      body: JSON.stringify({ abstractId, comment }),
    })
  },

  getAll: async () => {
    return apiRequest<AbstractComment[]>('/abstract-comments', {
      method: 'GET',
    })
  },

  getById: async (id: number) => {
    return apiRequest<AbstractComment>(`/abstract-comments/${id}`, {
      method: 'GET',
    })
  },

  getByAbstractId: async (abstractId: number) => {
    return apiRequest<AbstractComment[]>(`/abstract-comments/abstract/${abstractId}`, {
      method: 'GET',
    })
  },

  update: async (id: number, comment: string) => {
    return apiRequest<AbstractComment>(`/abstract-comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    })
  },

  delete: async (id: number) => {
    return apiRequest<void>(`/abstract-comments/${id}`, {
      method: 'DELETE',
    })
  },
}

// Co-authors API
export const coauthorsApi = {
  invite: async (abstractId: number, email: string) => {
    return apiRequest<AbstractCoauthor>(`/abstracts/${abstractId}/coauthors`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  getByAbstractId: async (abstractId: number) => {
    return apiRequest<AbstractCoauthor[]>(`/abstracts/${abstractId}/coauthors`, {
      method: 'GET',
    })
  },

  remove: async (abstractId: number, email: string) => {
    return apiRequest<void>(`/abstracts/${abstractId}/coauthors/${email}`, {
      method: 'DELETE',
    })
  },
}
