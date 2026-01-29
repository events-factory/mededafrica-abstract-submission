#!/bin/bash

# API Documentation Generator for Frontend Integration
# Usage: ./api-docs.sh

BASE_URL="${API_BASE_URL:-https://api.eventsfactory.rw/api/abstract}"

cat << 'EOF'
================================================================================
                    ABSTRACT SUBMISSION API DOCUMENTATION
                         Frontend Integration Guide
================================================================================

## Base URL
EOF
echo "  $BASE_URL"
cat << 'EOF'

## Authentication
All endpoints (except register/login) require JWT token in Authorization header:
  Authorization: Bearer <token>

================================================================================
                              AUTHENTICATION
================================================================================

### POST /auth/register
Register a new user account.

Request Body:
{
  "email": "user@example.com",        // required, unique
  "password": "password123",          // required, min 8 characters
  "firstName": "John",                // required
  "lastName": "Doe",                  // required
  "phoneNumber": "+1234567890",       // optional
  "companyName": "Company Inc",       // optional
  "address": "123 Main St",           // optional
  "city": "New York",                 // optional
  "country": "USA",                   // optional
  "eventName": "Conference 2026",     // optional
  "expectedAttendees": 100,           // optional, integer
  "neededServices": "Catering",       // optional
  "comments": "Notes",                // optional
  "profilePicture": "https://..."     // optional, URL
}

Response (201):
{
  "message": "Registration successful",
  "data": {
    "user": { ...user object without password... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

Errors:
  409 - Email already registered

--------------------------------------------------------------------------------

### POST /auth/login
Login with existing credentials.

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isStaff": false,
      "isActive": true,
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

Errors:
  401 - Invalid email or password
  401 - Account is deactivated

--------------------------------------------------------------------------------

### GET /auth/profile
Get current user's profile. Requires authentication.

Response (200):
{
  "message": "Profile retrieved successfully",
  "data": { ...user object... }
}

--------------------------------------------------------------------------------

### PUT /auth/profile
Update current user's profile. Requires authentication.
Note: Cannot change email or password through this endpoint.

Request Body (all fields optional):
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+0987654321",
  ...
}

Response (200):
{
  "message": "Profile updated successfully",
  "data": { ...updated user object... }
}

================================================================================
                               ABSTRACTS
================================================================================

### POST /abstracts
Create a new abstract submission. Requires authentication.
New abstracts are created with status: "pending"

Request Body:
{
  "subThemeCategory": "THEME_1",      // required, enum: THEME_1-THEME_6
  "title": "Research Title",          // required, max 255 chars
  "authorInformation": "Author...",   // required, text
  "presentationType": "Oral",         // required, enum: Oral, Poster, Workshop
  "presenterFullName": "John Doe",    // required
  "presenterEmail": "john@uni.edu",   // required, valid email
  "presenterPhone": "+1234567890",    // required
  "presenterInstitution": "MIT",      // required
  "presenterCountry": "USA",          // required
  "deanContact": "dean@uni.edu",      // optional
  "abstractBody": "Full abstract..."  // required, text
}

Response (201):
{
  "message": "Abstract created successfully",
  "data": {
    "id": 1,
    "status": "pending",
    "submittedBy": "user@example.com",
    ...all fields...
  }
}

--------------------------------------------------------------------------------

### GET /abstracts
Get all abstracts. Requires authentication.
- Regular users: See only their own abstracts
- Staff users: See all abstracts

Response (200):
{
  "message": "Abstracts retrieved successfully",
  "data": [ ...array of abstracts... ]
}

--------------------------------------------------------------------------------

### GET /abstracts/:id
Get a single abstract by ID. Requires authentication.
- Regular users: Can only view their own abstracts
- Staff users: Can view any abstract

Response (200):
{
  "message": "Abstract retrieved successfully",
  "data": { ...abstract object... }
}

Errors:
  404 - Abstract not found
  403 - You can only view your own abstracts

--------------------------------------------------------------------------------

### PUT /abstracts/:id
Update an abstract. Requires authentication.
- Only the owner can update
- Cannot update if status is "approved" or "rejected"

Request Body (all fields optional):
{
  "title": "Updated Title",
  "abstractBody": "Updated content...",
  ...
}

Response (200):
{
  "message": "Abstract updated successfully",
  "data": { ...updated abstract... }
}

Errors:
  404 - Abstract not found
  403 - You can only update abstracts you submitted
  403 - Cannot edit an abstract that has been approved or rejected

--------------------------------------------------------------------------------

### DELETE /abstracts/:id
Delete an abstract. Requires authentication.
Only the owner can delete their abstract.

Response (200):
{
  "message": "Abstract deleted successfully"
}

Errors:
  404 - Abstract not found
  403 - You can only delete abstracts you submitted

================================================================================
                         ABSTRACT REVIEW (Staff Only)
================================================================================

### PATCH /abstracts/:id/approve
Approve an abstract. Staff only.

Request Body:
{
  "note": "Excellent work!"  // optional, review feedback
}

Response (200):
{
  "message": "Abstract approved successfully",
  "data": {
    "status": "approved",
    "reviewNote": "Excellent work!",
    "reviewedBy": "staff@example.com",
    "reviewedAt": "2026-01-29T12:00:00.000Z",
    ...
  }
}

Errors:
  403 - Only staff can approve abstracts
  404 - Abstract not found

--------------------------------------------------------------------------------

### PATCH /abstracts/:id/reject
Reject an abstract. Staff only.

Request Body:
{
  "note": "Does not meet criteria"  // optional
}

Response (200):
{
  "message": "Abstract rejected successfully",
  "data": {
    "status": "rejected",
    ...
  }
}

Errors:
  403 - Only staff can reject abstracts
  404 - Abstract not found

--------------------------------------------------------------------------------

### PATCH /abstracts/:id/request-more-info
Request more information on an abstract. Staff only.

Request Body:
{
  "note": "Please clarify methodology"  // optional
}

Response (200):
{
  "message": "More information requested successfully",
  "data": {
    "status": "more_info_requested",
    ...
  }
}

Errors:
  403 - Only staff can request more information
  404 - Abstract not found

================================================================================
                            ABSTRACT COMMENTS
================================================================================

### POST /abstract-comments
Create a comment on an abstract. Requires authentication.
- Regular users: Can only comment on their OWN abstracts
- Staff users: Can comment on ANY abstract

Request Body:
{
  "abstractId": 1,                          // required, integer
  "comment": "Review feedback here..."      // required, text
}

Response (201):
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

Errors:
  404 - Abstract not found
  403 - You can only comment on your own abstracts (non-staff)

--------------------------------------------------------------------------------

### GET /abstract-comments
Get all comments. Requires authentication.

Response (200):
{
  "message": "Comments retrieved successfully",
  "data": [ ...array of comments with abstract info... ]
}

--------------------------------------------------------------------------------

### GET /abstract-comments/:id
Get a single comment by ID. Requires authentication.

Response (200):
{
  "message": "Comment retrieved successfully",
  "data": { ...comment with abstract info... }
}

--------------------------------------------------------------------------------

### GET /abstract-comments/abstract/:abstractId
Get all comments for a specific abstract. Requires authentication.

Response (200):
{
  "message": "Comments for abstract retrieved successfully",
  "data": [ ...array of comments... ]
}

--------------------------------------------------------------------------------

### PUT /abstract-comments/:id
Update a comment. Requires authentication.
Only the comment owner can update.

Request Body:
{
  "comment": "Updated comment text"
}

Response (200):
{
  "message": "Comment updated successfully",
  "data": { ...updated comment... }
}

Errors:
  404 - Comment not found
  403 - You can only update comments you submitted

--------------------------------------------------------------------------------

### DELETE /abstract-comments/:id
Delete a comment. Requires authentication.
Only the comment owner can delete.

Response (200):
{
  "message": "Comment deleted successfully"
}

Errors:
  404 - Comment not found
  403 - You can only delete comments you submitted

================================================================================
                              ENUMS & CONSTANTS
================================================================================

### Sub-Theme Categories
- THEME_1
- THEME_2
- THEME_3
- THEME_4
- THEME_5
- THEME_6

### Presentation Types
- Oral
- Poster
- Workshop

### Abstract Status
- pending           (default, can be edited)
- approved          (cannot be edited)
- rejected          (cannot be edited)
- more_info_requested (can be edited)

================================================================================
                            PERMISSION SUMMARY
================================================================================

| Action                  | Regular User              | Staff User        |
|-------------------------|---------------------------|-------------------|
| View abstracts          | Own only                  | All               |
| Edit abstracts          | Own (if not approved/rejected) | No           |
| Delete abstracts        | Own only                  | No                |
| Comment on abstracts    | Own only                  | All               |
| Approve/Reject          | No                        | Yes               |
| Request more info       | No                        | Yes               |

================================================================================
                           ERROR RESPONSE FORMAT
================================================================================

All errors follow this format:
{
  "message": "Error description",
  "error": "Error Type",
  "statusCode": 400
}

Common status codes:
- 400 - Bad Request (validation errors)
- 401 - Unauthorized (missing/invalid token)
- 403 - Forbidden (permission denied)
- 404 - Not Found
- 409 - Conflict (duplicate email)

================================================================================
                          TYPESCRIPT INTERFACES
================================================================================

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

================================================================================
                            CURL EXAMPLES
================================================================================

# Register
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Profile (with token)
curl -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Abstract
curl -X POST "$BASE_URL/abstracts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subThemeCategory":"THEME_1",
    "title":"My Research Title",
    "authorInformation":"John Doe, MIT",
    "presentationType":"Oral",
    "presenterFullName":"John Doe",
    "presenterEmail":"john@mit.edu",
    "presenterPhone":"+1234567890",
    "presenterInstitution":"MIT",
    "presenterCountry":"USA",
    "abstractBody":"This is my abstract content..."
  }'

# Get All Abstracts
curl -X GET "$BASE_URL/abstracts" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Approve Abstract (Staff only)
curl -X PATCH "$BASE_URL/abstracts/1/approve" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STAFF_TOKEN" \
  -d '{"note":"Approved for presentation"}'

# Create Comment
curl -X POST "$BASE_URL/abstract-comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"abstractId":1,"comment":"Great research!"}'

================================================================================
EOF

echo ""
echo "Documentation generated successfully!"
echo "Base URL: $BASE_URL"
echo ""
