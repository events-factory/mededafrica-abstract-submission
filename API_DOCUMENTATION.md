# Abstract Submission API Documentation

> Frontend Integration Guide

## Base URL

```
http://localhost:42000
```

## Authentication

All endpoints (except register/login) require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

---

# Authentication Endpoints

## POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "companyName": "Company Inc",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "eventName": "Conference 2026",
  "expectedAttendees": 100,
  "neededServices": "Catering",
  "comments": "Notes",
  "profilePicture": "https://..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Unique email address |
| password | string | Yes | Min 8 characters |
| firstName | string | Yes | User's first name |
| lastName | string | Yes | User's last name |
| phoneNumber | string | No | Phone number |
| companyName | string | No | Company name |
| address | string | No | Address |
| city | string | No | City |
| country | string | No | Country |
| eventName | string | No | Event name |
| expectedAttendees | number | No | Expected attendees |
| neededServices | string | No | Needed services |
| comments | string | No | Additional comments |
| profilePicture | string | No | Profile picture URL |

**Response (201):**

```json
{
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isStaff": false,
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 409 | Email already registered |

---

## POST /auth/login

Login with existing credentials.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isStaff": false,
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 401 | Invalid email or password |
| 401 | Account is deactivated |

---

## GET /auth/profile

Get current user's profile. **Requires authentication.**

**Response (200):**

```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isStaff": false,
    "isActive": true
  }
}
```

---

## PUT /auth/profile

Update current user's profile. **Requires authentication.**

> **Note:** Cannot change email or password through this endpoint.

**Request Body (all fields optional):**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+0987654321"
}
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

---

## POST /auth/invite-staff

Invite a new staff member. **Staff only.**

Creates a new user account with `isStaff=true`.

**Request Body:**

```json
{
  "email": "newstaff@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Unique email address |
| password | string | Yes | Min 8 characters |
| firstName | string | Yes | Staff member's first name |
| lastName | string | Yes | Staff member's last name |

**Response (201):**

```json
{
  "message": "Staff member invited successfully",
  "data": {
    "id": 5,
    "email": "newstaff@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "isStaff": true,
    "isActive": true
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 403 | Only staff can invite other staff members |
| 409 | Email already registered |

---

# Abstract Endpoints

## POST /abstracts

Create a new abstract submission. **Requires authentication.**

New abstracts are created with status: `pending`

**Request Body:**

```json
{
  "subThemeCategory": "THEME_1",
  "title": "Research Title",
  "authorInformation": "Author details...",
  "presentationType": "Oral",
  "presenterFullName": "John Doe",
  "presenterEmail": "john@uni.edu",
  "presenterPhone": "+1234567890",
  "presenterInstitution": "MIT",
  "presenterCountry": "USA",
  "deanContact": "dean@uni.edu",
  "abstractBody": "Full abstract content..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subThemeCategory | enum | Yes | One of: THEME_1, THEME_2, THEME_3, THEME_4, THEME_5, THEME_6 |
| title | string | Yes | Max 255 characters |
| authorInformation | string | Yes | Author details |
| presentationType | enum | Yes | One of: Oral, Poster, Workshop |
| presenterFullName | string | Yes | Presenter's full name |
| presenterEmail | string | Yes | Valid email address |
| presenterPhone | string | Yes | Phone number |
| presenterInstitution | string | Yes | Institution name |
| presenterCountry | string | Yes | Country |
| deanContact | string | No | Dean's contact information |
| abstractBody | string | Yes | Full abstract content |

**Response (201):**

```json
{
  "message": "Abstract created successfully",
  "data": {
    "id": 1,
    "status": "pending",
    "submittedBy": "user@example.com",
    "title": "Research Title",
    "subThemeCategory": "THEME_1",
    "presentationType": "Oral",
    "createdAt": "2026-01-29T12:00:00.000Z",
    "updatedAt": "2026-01-29T12:00:00.000Z"
  }
}
```

---

## GET /abstracts

Get all abstracts. **Requires authentication.**

- **Regular users:** See only their own abstracts + co-authored abstracts
- **Staff users:** See all abstracts

**Response (200):**

```json
{
  "message": "Abstracts retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Research Title",
      "status": "pending",
      "submittedBy": "user@example.com"
    }
  ]
}
```

---

## GET /abstracts/:id

Get a single abstract by ID. **Requires authentication.**

- **Regular users:** Can only view their own abstracts or co-authored abstracts
- **Staff users:** Can view any abstract

**Response (200):**

```json
{
  "message": "Abstract retrieved successfully",
  "data": {
    "id": 1,
    "title": "Research Title",
    "status": "pending",
    "submittedBy": "user@example.com"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | Abstract not found |
| 403 | You can only view your own abstracts |

---

## PUT /abstracts/:id

Update an abstract. **Requires authentication.**

- Only the owner or co-authors can update
- Cannot update if status is `approved` or `rejected`

**Request Body (all fields optional):**

```json
{
  "title": "Updated Title",
  "abstractBody": "Updated content..."
}
```

**Response (200):**

```json
{
  "message": "Abstract updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    "status": "pending"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | Abstract not found |
| 403 | You can only update abstracts you submitted or co-author |
| 403 | Cannot edit an abstract that has been approved or rejected |

---

## DELETE /abstracts/:id

Delete an abstract. **Requires authentication.**

Only the owner can delete their abstract.

**Response (200):**

```json
{
  "message": "Abstract deleted successfully"
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | Abstract not found |
| 403 | You can only delete abstracts you submitted |

---

# Abstract Review Endpoints (Staff Only)

## PATCH /abstracts/:id/approve

Approve an abstract. **Staff only.**

**Request Body:**

```json
{
  "note": "Excellent work!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| note | string | No | Review feedback |

**Response (200):**

```json
{
  "message": "Abstract approved successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "reviewNote": "Excellent work!",
    "reviewedBy": "staff@example.com",
    "reviewedAt": "2026-01-29T12:00:00.000Z"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 403 | Only staff can approve abstracts |
| 404 | Abstract not found |

---

## PATCH /abstracts/:id/reject

Reject an abstract. **Staff only.**

**Request Body:**

```json
{
  "note": "Does not meet criteria"
}
```

**Response (200):**

```json
{
  "message": "Abstract rejected successfully",
  "data": {
    "id": 1,
    "status": "rejected",
    "reviewNote": "Does not meet criteria",
    "reviewedBy": "staff@example.com",
    "reviewedAt": "2026-01-29T12:00:00.000Z"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 403 | Only staff can reject abstracts |
| 404 | Abstract not found |

---

## PATCH /abstracts/:id/request-more-info

Request more information on an abstract. **Staff only.**

**Request Body:**

```json
{
  "note": "Please clarify methodology"
}
```

**Response (200):**

```json
{
  "message": "More information requested successfully",
  "data": {
    "id": 1,
    "status": "more_info_requested",
    "reviewNote": "Please clarify methodology",
    "reviewedBy": "staff@example.com",
    "reviewedAt": "2026-01-29T12:00:00.000Z"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 403 | Only staff can request more information |
| 404 | Abstract not found |

---

# Comment Endpoints

## POST /abstract-comments

Create a comment on an abstract. **Requires authentication.**

- **Regular users:** Can only comment on their OWN abstracts
- **Staff users:** Can comment on ANY abstract

**Request Body:**

```json
{
  "abstractId": 1,
  "comment": "Review feedback here..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| abstractId | number | Yes | ID of the abstract |
| comment | string | Yes | Comment text |

**Response (201):**

```json
{
  "message": "Comment created successfully",
  "data": {
    "id": 1,
    "abstractId": 1,
    "comment": "Review feedback here...",
    "submittedBy": "user@example.com",
    "createdAt": "2026-01-29T12:00:00.000Z",
    "updatedAt": "2026-01-29T12:00:00.000Z"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | Abstract not found |
| 403 | You can only comment on your own abstracts |

---

## GET /abstract-comments

Get all comments. **Requires authentication.**

**Response (200):**

```json
{
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": 1,
      "abstractId": 1,
      "comment": "Review feedback here...",
      "submittedBy": "user@example.com"
    }
  ]
}
```

---

## GET /abstract-comments/:id

Get a single comment by ID. **Requires authentication.**

**Response (200):**

```json
{
  "message": "Comment retrieved successfully",
  "data": {
    "id": 1,
    "abstractId": 1,
    "comment": "Review feedback here...",
    "submittedBy": "user@example.com"
  }
}
```

---

## GET /abstract-comments/abstract/:abstractId

Get all comments for a specific abstract. **Requires authentication.**

**Response (200):**

```json
{
  "message": "Comments for abstract retrieved successfully",
  "data": [
    {
      "id": 1,
      "abstractId": 1,
      "comment": "Review feedback here...",
      "submittedBy": "user@example.com"
    }
  ]
}
```

---

## PUT /abstract-comments/:id

Update a comment. **Requires authentication.**

Only the comment owner can update.

**Request Body:**

```json
{
  "comment": "Updated comment text"
}
```

**Response (200):**

```json
{
  "message": "Comment updated successfully",
  "data": {
    "id": 1,
    "comment": "Updated comment text"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | Comment not found |
| 403 | You can only update comments you submitted |

---

## DELETE /abstract-comments/:id

Delete a comment. **Requires authentication.**

Only the comment owner can delete.

**Response (200):**

```json
{
  "message": "Comment deleted successfully"
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 404 | Comment not found |
| 403 | You can only delete comments you submitted |

---

# Co-Author Endpoints

## POST /abstracts/:id/coauthors

Invite a co-author to collaborate on an abstract. **Owner only.**

Co-authors can view and edit the abstract (unless approved/rejected).

**Request Body:**

```json
{
  "email": "coauthor@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |

**Response (201):**

```json
{
  "message": "Co-author invited successfully",
  "data": {
    "id": 1,
    "abstractId": 5,
    "userEmail": "coauthor@example.com",
    "invitedBy": "owner@example.com",
    "createdAt": "2026-01-29T12:00:00.000Z"
  }
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 403 | Only the abstract owner can invite co-authors |
| 403 | You cannot invite yourself as a co-author |
| 404 | Abstract not found |
| 409 | User is already a co-author |

---

## GET /abstracts/:id/coauthors

Get all co-authors of an abstract. **Requires authentication.**

**Response (200):**

```json
{
  "message": "Co-authors retrieved successfully",
  "data": [
    {
      "id": 1,
      "abstractId": 5,
      "userEmail": "coauthor@example.com",
      "invitedBy": "owner@example.com",
      "createdAt": "2026-01-29T12:00:00.000Z"
    }
  ]
}
```

---

## DELETE /abstracts/:id/coauthors/:email

Remove a co-author from an abstract. **Owner only.**

**Response (200):**

```json
{
  "message": "Co-author removed successfully"
}
```

**Errors:**

| Status | Message |
|--------|---------|
| 403 | Only the abstract owner can remove co-authors |
| 404 | Abstract not found |
| 404 | Co-author not found |

---

# History & Changelog Endpoints

## GET /abstracts/:id/history

Get change history for an abstract. Shows all changes in reverse chronological order.

**Response (200):**

```json
{
  "message": "History retrieved successfully",
  "data": [
    {
      "id": 5,
      "abstractId": 1,
      "changedBy": "user@example.com",
      "changeType": "updated",
      "previousValues": {
        "title": "Old Title"
      },
      "newValues": {
        "title": "New Title"
      },
      "createdAt": "2026-01-29T12:00:00.000Z"
    }
  ]
}
```

---

## GET /abstracts/:id/changelog

Get detailed changelog with field-level diffs. Shows who changed what and when.

Useful for frontend to display tracked changes with highlighting.

**Response (200):**

```json
{
  "message": "Changelog retrieved successfully",
  "data": {
    "currentVersion": {
      "id": 1,
      "title": "Updated Title",
      "status": "approved"
    },
    "changes": [
      {
        "changedBy": "owner@example.com",
        "changeType": "created",
        "changedAt": "2026-01-29T10:00:00.000Z",
        "fieldChanges": [
          {
            "field": "title",
            "oldValue": null,
            "newValue": "Initial Title"
          }
        ]
      },
      {
        "changedBy": "coauthor@example.com",
        "changeType": "updated",
        "changedAt": "2026-01-29T11:00:00.000Z",
        "fieldChanges": [
          {
            "field": "title",
            "oldValue": "Initial Title",
            "newValue": "Updated Title"
          }
        ]
      },
      {
        "changedBy": "staff@example.com",
        "changeType": "status_changed",
        "changedAt": "2026-01-29T12:00:00.000Z",
        "fieldChanges": [
          {
            "field": "status",
            "oldValue": "pending",
            "newValue": "approved"
          }
        ]
      }
    ]
  }
}
```

### Frontend Display Suggestion

| Element | Style |
|---------|-------|
| `oldValue` | Red background with strikethrough |
| `newValue` | Green background |
| `changedBy` | Display in brackets near change: "Updated Title *(coauthor@example.com)*" |

---

# Enums & Constants

## Sub-Theme Categories

| Value | Description |
|-------|-------------|
| `THEME_1` | Theme 1 |
| `THEME_2` | Theme 2 |
| `THEME_3` | Theme 3 |
| `THEME_4` | Theme 4 |
| `THEME_5` | Theme 5 |
| `THEME_6` | Theme 6 |

## Presentation Types

| Value | Description |
|-------|-------------|
| `Oral` | Oral presentation |
| `Poster` | Poster presentation |
| `Workshop` | Workshop session |

## Abstract Status

| Value | Description | Editable |
|-------|-------------|----------|
| `pending` | Default status | Yes |
| `approved` | Approved by staff | No |
| `rejected` | Rejected by staff | No |
| `more_info_requested` | Staff requested more info | Yes |

---

# Permission Summary

| Action | Regular User | Staff User |
|--------|--------------|------------|
| View abstracts | Own + co-authored | All |
| Edit abstracts | Own + co-authored (if not approved/rejected) | No |
| Delete abstracts | Own only | No |
| Comment on abstracts | Own only | All |
| Invite co-authors | Own abstracts only | No |
| Remove co-authors | Own abstracts only | No |
| View history/changelog | Yes | Yes |
| Approve/Reject | No | Yes |
| Request more info | No | Yes |
| Invite staff | No | Yes |

---

# Error Response Format

All errors follow this format:

```json
{
  "message": "Error description",
  "error": "Error Type",
  "statusCode": 400
}
```

## Common Status Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (permission denied) |
| 404 | Not Found |
| 409 | Conflict (duplicate email) |

---

# TypeScript Interfaces

```typescript
interface User {
  id: number;
  email: string;
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
  isActive: boolean;
  isStaff: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Abstract {
  id: number;
  subThemeCategory: 'THEME_1' | 'THEME_2' | 'THEME_3' | 'THEME_4' | 'THEME_5' | 'THEME_6';
  title: string;
  authorInformation: string;
  presentationType: 'Oral' | 'Poster' | 'Workshop';
  presenterFullName: string;
  presenterEmail: string;
  presenterPhone: string;
  presenterInstitution: string;
  presenterCountry: string;
  deanContact?: string;
  abstractBody: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AbstractComment {
  id: number;
  abstractId: number;
  comment: string;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
  abstract?: Abstract;
}

interface AbstractCoauthor {
  id: number;
  abstractId: number;
  userEmail: string;
  invitedBy: string;
  createdAt: string;
}

interface AbstractHistory {
  id: number;
  abstractId: number;
  changedBy: string;
  changeType: 'created' | 'updated' | 'status_changed';
  previousValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  createdAt: string;
}

interface ChangelogEntry {
  changedBy: string;
  changeType: string;
  changedAt: string;
  fieldChanges: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

interface Changelog {
  currentVersion: Abstract;
  changes: ChangelogEntry[];
}

interface AuthResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface ErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}
```

---

# cURL Examples

## Authentication

### Register

```bash
curl -X POST "http://localhost:42000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login

```bash
curl -X POST "http://localhost:42000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Profile

```bash
curl -X GET "http://localhost:42000/auth/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Invite Staff (Staff only)

```bash
curl -X POST "http://localhost:42000/auth/invite-staff" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{
    "email": "newstaff@example.com",
    "password": "password123",
    "firstName": "New",
    "lastName": "Staff"
  }'
```

## Abstracts

### Create Abstract

```bash
curl -X POST "http://localhost:42000/abstracts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subThemeCategory": "THEME_1",
    "title": "My Research Title",
    "authorInformation": "John Doe, MIT",
    "presentationType": "Oral",
    "presenterFullName": "John Doe",
    "presenterEmail": "john@mit.edu",
    "presenterPhone": "+1234567890",
    "presenterInstitution": "MIT",
    "presenterCountry": "USA",
    "abstractBody": "This is my abstract content..."
  }'
```

### Get All Abstracts

```bash
curl -X GET "http://localhost:42000/abstracts" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Abstract

```bash
curl -X GET "http://localhost:42000/abstracts/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Abstract

```bash
curl -X PUT "http://localhost:42000/abstracts/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Research Title"
  }'
```

### Delete Abstract

```bash
curl -X DELETE "http://localhost:42000/abstracts/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Review Actions (Staff Only)

### Approve Abstract

```bash
curl -X PATCH "http://localhost:42000/abstracts/1/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{
    "note": "Approved for presentation"
  }'
```

### Reject Abstract

```bash
curl -X PATCH "http://localhost:42000/abstracts/1/reject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{
    "note": "Does not meet criteria"
  }'
```

### Request More Info

```bash
curl -X PATCH "http://localhost:42000/abstracts/1/request-more-info" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{
    "note": "Please clarify methodology"
  }'
```

## Comments

### Create Comment

```bash
curl -X POST "http://localhost:42000/abstract-comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "abstractId": 1,
    "comment": "Great research!"
  }'
```

### Get Comments for Abstract

```bash
curl -X GET "http://localhost:42000/abstract-comments/abstract/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Co-Authors

### Invite Co-author

```bash
curl -X POST "http://localhost:42000/abstracts/1/coauthors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "coauthor@example.com"
  }'
```

### Get Co-authors

```bash
curl -X GET "http://localhost:42000/abstracts/1/coauthors" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Remove Co-author

```bash
curl -X DELETE "http://localhost:42000/abstracts/1/coauthors/coauthor@example.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## History & Changelog

### Get History

```bash
curl -X GET "http://localhost:42000/abstracts/1/history" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Changelog

```bash
curl -X GET "http://localhost:42000/abstracts/1/changelog" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

# Email Notifications

The system automatically sends email notifications for the following events:

| Event | Recipient | Email Subject |
|-------|-----------|---------------|
| Abstract Submitted | Submitter | "Abstract Submitted Successfully" |
| Co-author Invited | Co-author | "You Have Been Added as a Co-Author" |
| Abstract Approved | Submitter | "Congratulations! Your Abstract Has Been Approved" |
| Abstract Rejected | Submitter | "Update on Your Abstract Submission" |
| More Info Requested | Submitter | "Action Required: Additional Information Needed" |
| Staff Invited | New Staff | "Welcome to the Review Team" |

## Environment Variables

```bash
NOTIFICATION_SERVICE_URL=http://localhost:8001
NOTIFICATION_AUTH_USERNAME=admin
NOTIFICATION_AUTH_PASSWORD=password
NOTIFICATION_FROM_EMAIL=noreply@smartevents.rw
NOTIFICATION_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxx
APP_URL=https://yourapp.com
```

> **Note:** Notifications are sent asynchronously and do not block API responses. If the notification service is unavailable, the main operation still succeeds.

---

*Documentation generated on Thu Jan 29 20:27:19 CAT 2026*

*Base URL: http://localhost:42000*
