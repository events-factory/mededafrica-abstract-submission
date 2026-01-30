export interface User {
  id: number
  email: string
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
  isActive: boolean
  isStaff: boolean
  createdAt: string
  updatedAt: string
}

export interface Abstract {
  id: number
  subThemeCategory: 'THEME_1' | 'THEME_2' | 'THEME_3' | 'THEME_4' | 'THEME_5' | 'THEME_6'
  title: string
  authorInformation: string
  presentationType: 'Oral' | 'Poster' | 'Workshop'
  presenterFullName: string
  presenterEmail: string
  presenterPhone: string
  presenterInstitution: string
  presenterCountry: string
  deanContact?: string
  abstractBody: string
  submittedBy: string
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested'
  points?: number | null
  reviewNote?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AbstractComment {
  id: number
  abstractId: number
  comment: string
  submittedBy: string
  createdAt: string
  updatedAt: string
  abstract?: Abstract
}

export interface AbstractCoauthor {
  id: number
  abstractId: number
  userEmail: string
  invitedBy: string
  createdAt: string
}

export interface AuthResponse {
  message: string
  data: {
    user: User
    token: string
  }
}

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface ErrorResponse {
  message: string | string[]
  error: string
  statusCode: number
}

export interface AbstractHistory {
  id: number
  abstractId: number
  changedBy: string
  changeType: 'created' | 'updated' | 'status_changed'
  previousValues: Record<string, any> | null
  newValues: Record<string, any> | null
  createdAt: string
}

export interface ChangelogEntry {
  changedBy: string
  changeType: string
  changedAt: string
  fieldChanges: Array<{
    field: string
    oldValue: any
    newValue: any
  }>
}

export interface Changelog {
  currentVersion: Abstract
  changes: ChangelogEntry[]
}
