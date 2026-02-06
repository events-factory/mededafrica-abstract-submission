import {
  User,
  Abstract,
  AbstractComment,
  AbstractCoauthor,
  AbstractHistory,
  Changelog,
  ApiResponse,
} from './types';

// Use local proxy to avoid CORS issues
const API_BASE_URL = '/api/proxy';

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        message: data.message || 'Request failed',
        data: data.data as T,
      };
    }

    return {
      message: data.message,
      data: data.data as T,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Network error',
      data: {} as T,
    };
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    companyName?: string;
    address?: string;
    city?: string;
    country?: string;
    eventName?: string;
    expectedAttendees?: number;
    neededServices?: string;
    comments?: string;
    profilePicture?: string;
  }) => {
    return apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return apiRequest<User>('/auth/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (userData: Partial<User>) => {
    return apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  inviteStaff: async (staffData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    return apiRequest<User>('/auth/invite-staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Abstracts API
export const abstractsApi = {
  create: async (
    abstractData: Omit<
      Abstract,
      | 'id'
      | 'submittedBy'
      | 'status'
      | 'createdAt'
      | 'updatedAt'
      | 'reviewNote'
      | 'reviewedBy'
      | 'reviewedAt'
    >,
  ) => {
    return apiRequest<Abstract>('/abstracts', {
      method: 'POST',
      body: JSON.stringify(abstractData),
    });
  },

  getAll: async () => {
    return apiRequest<Abstract[]>('/abstracts', {
      method: 'GET',
    });
  },

  getById: async (id: number) => {
    return apiRequest<Abstract>(`/abstracts/${id}`, {
      method: 'GET',
    });
  },

  update: async (id: number, abstractData: Partial<Abstract>) => {
    return apiRequest<Abstract>(`/abstracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(abstractData),
    });
  },

  delete: async (id: number) => {
    return apiRequest<void>(`/abstracts/${id}`, {
      method: 'DELETE',
    });
  },

  approve: async (id: number, note?: string, points?: number) => {
    return apiRequest<Abstract>(`/abstracts/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ note, points }),
    });
  },

  reject: async (id: number, note?: string) => {
    return apiRequest<Abstract>(`/abstracts/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  },

  requestMoreInfo: async (id: number, note?: string) => {
    return apiRequest<Abstract>(`/abstracts/${id}/request-more-info`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });
  },

  getHistory: async (id: number) => {
    return apiRequest<AbstractHistory[]>(`/abstracts/${id}/history`, {
      method: 'GET',
    });
  },

  getChangelog: async (id: number) => {
    return apiRequest<Changelog>(`/abstracts/${id}/changelog`, {
      method: 'GET',
    });
  },
};

// Comments API
export const commentsApi = {
  create: async (abstractId: number, comment: string) => {
    return apiRequest<AbstractComment>('/abstract-comments', {
      method: 'POST',
      body: JSON.stringify({ abstractId, comment }),
    });
  },

  getAll: async () => {
    return apiRequest<AbstractComment[]>('/abstract-comments', {
      method: 'GET',
    });
  },

  getById: async (id: number) => {
    return apiRequest<AbstractComment>(`/abstract-comments/${id}`, {
      method: 'GET',
    });
  },

  getByAbstractId: async (abstractId: number) => {
    return apiRequest<AbstractComment[]>(
      `/abstract-comments/abstract/${abstractId}`,
      {
        method: 'GET',
      },
    );
  },

  update: async (id: number, comment: string) => {
    return apiRequest<AbstractComment>(`/abstract-comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    });
  },

  delete: async (id: number) => {
    return apiRequest<void>(`/abstract-comments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API (for staff to view participants)
export const usersApi = {
  getAll: async () => {
    return apiRequest<User[]>('/users', {
      method: 'GET',
    });
  },

  getById: async (id: number) => {
    return apiRequest<User>(`/users/${id}`, {
      method: 'GET',
    });
  },
};

// SmartEvent API base URL
const SMARTEVENT_API_URL = '/api/smartevent';

// Helper function for SmartEvent API requests
async function smartEventRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const response = await fetch(`${SMARTEVENT_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
      },
    });

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('SmartEvent API error:', error);
    throw error;
  }
}

// Delegate types
export interface DelegateTableHeader {
  id: number;
  inputcode: string;
  nameEnglish: string;
  inputtype: number;
}

export interface Delegate {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface DelegatesListResponse {
  success: boolean;
  data: Delegate[];
  total?: number;
  message?: string;
}

export interface TableHeadersResponse {
  success: boolean;
  data: DelegateTableHeader[];
  message?: string;
}

// Delegates API
export const delegatesApi = {
  invite: async (delegateData: {
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    return apiRequest<{ id: number; email: string }>('/delegates/invite', {
      method: 'POST',
      body: JSON.stringify(delegateData),
    });
  },

  // Get table headers/columns for delegates
  getTableHeaders: async (): Promise<TableHeadersResponse> => {
    return smartEventRequest<TableHeadersResponse>(
      '/Get-Table-Headers/Get_Input_Generated/69848109c25ca',
      { method: 'GET' },
    );
  },

  // Get list of delegates
  getAll: async (): Promise<DelegatesListResponse> => {
    return smartEventRequest<DelegatesListResponse>(
      '/Delegates-Data/Get_Delegates_List/69848109c25ca',
      { method: 'POST' },
    );
  },
};

// Co-authors API
export const coauthorsApi = {
  invite: async (abstractId: number, email: string) => {
    return apiRequest<AbstractCoauthor>(`/abstracts/${abstractId}/coauthors`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  getByAbstractId: async (abstractId: number) => {
    return apiRequest<AbstractCoauthor[]>(
      `/abstracts/${abstractId}/coauthors`,
      {
        method: 'GET',
      },
    );
  },

  remove: async (abstractId: number, email: string) => {
    return apiRequest<void>(`/abstracts/${abstractId}/coauthors/${email}`, {
      method: 'DELETE',
    });
  },
};

// Conference Registration Types
export interface RegistrationCategory {
  id: number;
  name_english: string;
  name_french: string;
  fee: string;
  early_payment_date: string;
  end_date: string;
}

export interface FormInputOption {
  id: number;
  contentEnglish: string;
  contentFrench: string;
}

export interface FormInput {
  inputcode: string;
  nameEnglish: string;
  nameFrench: string;
  is_mandatory: 'YES' | 'NO';
  allow_other: 'YES' | 'NO';
  inputtype: {
    id: number;
    name: string;
  };
}

export interface FormInputGroup {
  group: {
    id: number;
    name: string;
    nameFrench: string;
  };
  inputs: Array<{
    input: FormInput;
    options: FormInputOption[];
    value: string;
  }>;
}

export interface RegistrationPageResponse {
  about: {
    english_description: string;
    french_description: string;
    banner: string;
  };
  event_description: {
    event_type: 'HYBRID' | 'PHYSICAL' | 'VIRTUAL';
  };
}

export interface CategoriesResponse {
  data: RegistrationCategory[];
}

export interface CategoryFormResponse {
  data: FormInputGroup[];
  category: {
    form_type: 'SINGLE' | 'MULTI';
    is_free: 'YES' | 'NO';
  };
}

// Registration submission response
export interface RegistrationSubmitResponse {
  message: string | string[];
  data?: {
    delegate_id?: string;
    order_id?: string;
  };
}

// Conference Registration API
export const registrationApi = {
  getRegistrationPage: async (): Promise<RegistrationPageResponse> => {
    return smartEventRequest<RegistrationPageResponse>(
      '/Registration-Page-Api',
      {
        method: 'GET',
      },
    );
  },

  getCategories: async (
    attendanceType: 'PHYSICAL' | 'VIRTUAL',
  ): Promise<CategoriesResponse> => {
    return smartEventRequest<CategoriesResponse>(
      '/Display-Registration-Categories',
      {
        method: 'POST',
        body: JSON.stringify({
          attendence: attendanceType,
          operation: 'get-categories',
        }),
      },
    );
  },

  getCategoryForm: async (
    categoryId: number,
    attendanceType: 'PHYSICAL' | 'VIRTUAL',
  ): Promise<CategoryFormResponse> => {
    return smartEventRequest<CategoryFormResponse>(
      '/Display-Categories-Form-Inputs',
      {
        method: 'POST',
        body: JSON.stringify({
          category: categoryId,
          attendence: attendanceType,
          operation: 'get-form-inputs',
        }),
      },
    );
  },

  submitRegistration: async (
    data:
      | FormData
      | {
          delegate_data: string;
          ticket_id: number;
          attendence_type: string;
          user_language: string;
          accompanied: string;
          registration_email?: string;
          first_name?: string;
          last_name?: string;
          order_id?: string;
          payment_token?: string;
          payment_session?: string;
        },
  ): Promise<{
    success: boolean;
    message: string | string[];
    data?: Record<string, unknown>;
  }> => {
    let body: BodyInit;
    let headers: Record<string, string> = {};

    if (data instanceof FormData) {
      // Send FormData as-is - browser will handle Content-Type with boundary
      body = data;
    } else {
      // For object data, JSON stringify
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(data);
    }

    const response = await fetch(`${SMARTEVENT_API_URL}/Register-Delegate`, {
      method: 'POST',
      headers,
      body,
    });
    const result = await response.json();
    return {
      success: response.ok,
      message: result.message,
      data: result.data,
    };
  },
};
