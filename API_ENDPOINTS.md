# API Endpoints Documentation

This document outlines all the API endpoints that need to be implemented on the backend for the Abstract Management System to function properly.

## Base URL
All endpoints should be prefixed with: `http://your-api-domain.com/api`

Configure this in your `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://your-api-domain.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### 1. User Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "submitter" // or "reviewer"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "submitter",
    "createdAt": "2024-01-29T10:00:00Z"
  },
  "token": "jwt-token-here"
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 2. User Registration
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "submitter" // or "reviewer"
}
```

**Success Response (201):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "submitter",
    "createdAt": "2024-01-29T10:00:00Z"
  },
  "token": "jwt-token-here"
}
```

**Error Response (400):**
```json
{
  "message": "Email already exists"
}
```

---

## Abstract Endpoints

### 3. Create Abstract
**Endpoint:** `POST /abstracts`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "presenter@example.com",
  "subThemeCategory": "Leadership, Governance, and African Ownership in Health Professions Education",
  "title": "Innovation in Medical Education",
  "authorInformation": "Dr. John Doe, PhD, john@example.com, University of Example",
  "presentationType": "Oral Presentation",
  "presenterFullName": "Dr. John Doe",
  "presenterEmail": "john@example.com",
  "presenterPhone": "+1234567890",
  "presenterInstitution": "University of Example",
  "presenterCountry": "Kenya",
  "deanContact": "dean@example.com, +0987654321",
  "abstractBody": "<p>Background: ...</p><p>Methods: ...</p>",
  "submittedBy": "user-uuid"
}
```

**Success Response (201):**
```json
{
  "id": "abstract-uuid",
  "email": "presenter@example.com",
  "subThemeCategory": "Leadership, Governance, and African Ownership in Health Professions Education",
  "title": "Innovation in Medical Education",
  "authorInformation": "Dr. John Doe, PhD, john@example.com, University of Example",
  "presentationType": "Oral Presentation",
  "presenterFullName": "Dr. John Doe",
  "presenterEmail": "john@example.com",
  "presenterPhone": "+1234567890",
  "presenterInstitution": "University of Example",
  "presenterCountry": "Kenya",
  "deanContact": "dean@example.com, +0987654321",
  "abstractBody": "<p>Background: ...</p><p>Methods: ...</p>",
  "status": "pending",
  "submittedBy": "user-uuid",
  "submittedAt": "2024-01-29T10:00:00Z"
}
```

---

### 4. Get All Abstracts
**Endpoint:** `GET /abstracts`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": "abstract-uuid-1",
    "email": "presenter1@example.com",
    "subThemeCategory": "Leadership, Governance, and African Ownership in Health Professions Education",
    "title": "Innovation in Medical Education",
    "authorInformation": "Dr. John Doe, PhD, john@example.com, University of Example",
    "presentationType": "Oral Presentation",
    "presenterFullName": "Dr. John Doe",
    "presenterEmail": "john@example.com",
    "presenterPhone": "+1234567890",
    "presenterInstitution": "University of Example",
    "presenterCountry": "Kenya",
    "deanContact": "dean@example.com, +0987654321",
    "abstractBody": "<p>Background: ...</p><p>Methods: ...</p>",
    "status": "pending",
    "submittedBy": "user-uuid",
    "submittedAt": "2024-01-29T10:00:00Z",
    "reviewedBy": null,
    "reviewedAt": null
  },
  {
    "id": "abstract-uuid-2",
    "email": "presenter2@example.com",
    "title": "Another Abstract",
    "status": "approved",
    "submittedAt": "2024-01-28T10:00:00Z",
    "reviewedBy": "reviewer-uuid",
    "reviewedAt": "2024-01-29T09:00:00Z"
  }
]
```

---

### 5. Get Abstract by ID
**Endpoint:** `GET /abstracts/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": "abstract-uuid",
  "email": "presenter@example.com",
  "subThemeCategory": "Leadership, Governance, and African Ownership in Health Professions Education",
  "title": "Innovation in Medical Education",
  "authorInformation": "Dr. John Doe, PhD, john@example.com, University of Example",
  "presentationType": "Oral Presentation",
  "presenterFullName": "Dr. John Doe",
  "presenterEmail": "john@example.com",
  "presenterPhone": "+1234567890",
  "presenterInstitution": "University of Example",
  "presenterCountry": "Kenya",
  "deanContact": "dean@example.com, +0987654321",
  "abstractBody": "<p>Background: ...</p><p>Methods: ...</p>",
  "status": "pending",
  "submittedBy": "user-uuid",
  "submittedAt": "2024-01-29T10:00:00Z",
  "reviewedBy": null,
  "reviewedAt": null
}
```

**Error Response (404):**
```json
{
  "message": "Abstract not found"
}
```

---

### 6. Update Abstract Status
**Endpoint:** `PATCH /abstracts/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "approved", // or "rejected", "info_requested", "pending"
  "reviewNote": "Optional review note"
}
```

**Success Response (200):**
```json
{
  "id": "abstract-uuid",
  "email": "presenter@example.com",
  "title": "Innovation in Medical Education",
  "status": "approved",
  "submittedBy": "user-uuid",
  "submittedAt": "2024-01-29T10:00:00Z",
  "reviewedBy": "reviewer-uuid",
  "reviewedAt": "2024-01-29T11:00:00Z"
}
```

---

## Comment Endpoints

### 7. Create Comment
**Endpoint:** `POST /comments`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "abstractId": "abstract-uuid",
  "content": "This is a review comment"
}
```

**Success Response (201):**
```json
{
  "id": "comment-uuid",
  "abstractId": "abstract-uuid",
  "userId": "user-uuid",
  "userName": "Jane Reviewer",
  "content": "This is a review comment",
  "createdAt": "2024-01-29T11:00:00Z"
}
```

---

### 8. Get Comments by Abstract ID
**Endpoint:** `GET /comments/:abstractId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
[
  {
    "id": "comment-uuid-1",
    "abstractId": "abstract-uuid",
    "userId": "user-uuid-1",
    "userName": "Jane Reviewer",
    "content": "This is a review comment",
    "createdAt": "2024-01-29T11:00:00Z"
  },
  {
    "id": "comment-uuid-2",
    "abstractId": "abstract-uuid",
    "userId": "user-uuid-2",
    "userName": "John Reviewer",
    "content": "Another comment",
    "createdAt": "2024-01-29T12:00:00Z"
  }
]
```

---

## Status Codes

- `200 OK`: Successful GET/PATCH request
- `201 Created`: Successful POST request
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Notes

1. All endpoints should validate the JWT token and check user permissions
2. The `/abstracts` endpoints (except POST) should only be accessible to users with role "reviewer"
3. The POST `/abstracts` endpoint should only be accessible to users with role "submitter"
4. Comments can only be created by reviewers
5. Dates should be in ISO 8601 format
6. The `abstractBody` field contains HTML from CKEditor 5 and should be sanitized on the backend
