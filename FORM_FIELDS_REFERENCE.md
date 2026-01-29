# Form Fields Reference

Complete list of all form inputs in the Abstract Management System for backend integration.

**API Base URL:** `https://api.eventsfactory.rw`

---

## 1. User Registration Form (Create Account)

**Endpoint:** `POST /api/auth/users/request-demo`

### Fields

| Field Name          | Input Name          | Type     | Required | Validation         | Description                                      |
| ------------------- | ------------------- | -------- | -------- | ------------------ | ------------------------------------------------ |
| Email Address       | `email`             | email    | Yes      | Valid email format | User's email                                     |
| First Name          | `firstName`         | text     | Yes      | Min 1 char         | User's first name                                |
| Last Name           | `lastName`          | text     | Yes      | Min 1 char         | User's last name                                 |
| Phone Number        | `phoneNumber`       | tel      | Yes      | Valid phone format | User's phone number                              |
| Company/Institution | `companyName`       | text     | Yes      | -                  | Institution or company name                      |
| Address             | `address`           | text     | Yes      | -                  | Physical address                                 |
| City                | `city`              | text     | Yes      | -                  | City                                             |
| Country             | `country`           | text     | Yes      | -                  | Country                                          |
| Event Name          | `eventName`         | text     | Yes      | -                  | Name of the event/conference                     |
| Expected Attendees  | `expectedAttendees` | number   | Yes      | Min 1              | Number of expected attendees                     |
| Needed Services     | `neededServices`    | text     | Yes      | -                  | Required services (e.g., Catering, Sound System) |
| Comments            | `comments`          | textarea | No       | -                  | Additional comments                              |
| Profile Picture     | `profilePicture`    | string   | No       | Valid URL          | URL to profile picture                           |

### Request Body Example

```json
{
  "email": "clement@example.com",
  "firstName": "Clement",
  "lastName": "Gakire",
  "phoneNumber": "+250787561924",
  "companyName": "Tech Solutions Inc",
  "address": "123 Main Street",
  "city": "New York",
  "country": "United States",
  "eventName": "Annual Conference 2025",
  "expectedAttendees": 150,
  "neededServices": "Catering, Sound System, Lighting",
  "comments": "Looking forward to the event",
  "profilePicture": "https://example.com/profile.jpg"
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-123",
      "email": "clement@example.com",
      "name": "Clement Gakire",
      "role": "submitter",
      "createdAt": "2024-01-29T10:30:00Z"
    }
  }
}
```

---

## 2. User Login Form

**Endpoint:** `POST /api/auth/login`

### Fields

| Field Name    | Input Name | Type     | Required | Validation         | Description     |
| ------------- | ---------- | -------- | -------- | ------------------ | --------------- |
| Email Address | `email`    | email    | Yes      | Valid email format | User's email    |
| Password      | `password` | password | Yes      | -                  | User's password |

**Note:** Role is determined by the backend based on user permissions, not sent from the frontend.

### Request Body Example

```json
{
  "email": "jane.smith@university.edu",
  "password": "SecurePass123"
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-123",
      "email": "jane.smith@university.edu",
      "name": "Dr. Jane Smith",
      "role": "submitter",
      "createdAt": "2024-01-29T10:30:00Z"
    }
  }
}
```

**Important:** The `role` field in the response determines where the user is redirected:

- `role: "reviewer"` → redirects to `/dashboard`
- `role: "submitter"` → redirects to `/submit`

---

## 3. Abstract Submission Form

**Endpoint:** `POST /api/abstracts`

### Fields

| Field Name              | Input Name             | Type      | Required | Max Length/Words | Description                                       |
| ----------------------- | ---------------------- | --------- | -------- | ---------------- | ------------------------------------------------- |
| Sub-theme Category      | `subThemeCategory`     | select    | Yes      | -                | Conference sub-theme (dropdown)                   |
| Abstract Title          | `title`                | text      | Yes      | 15 words         | Title of the abstract                             |
| Author Information      | `authorInformation`    | textarea  | Yes      | -                | All authors with name, degree, email, institution |
| Type of Presentation    | `presentationType`     | select    | Yes      | -                | Oral/Poster/Workshop                              |
| Presenter's Full Name   | `presenterFullName`    | text      | Yes      | -                | Name of the presenter                             |
| Presenter's Email       | `presenterEmail`       | email     | Yes      | Valid email      | Presenter's email address                         |
| Presenter's Phone       | `presenterPhone`       | tel       | Yes      | -                | Presenter's phone number                          |
| Presenter's Institution | `presenterInstitution` | text      | Yes      | -                | Affiliated institution                            |
| Presenter's Country     | `presenterCountry`     | text      | Yes      | -                | Country of institution                            |
| Dean Contact (Optional) | `deanContact`          | textarea  | No       | -                | Dean/Provost contact details                      |
| Abstract Body           | `abstractBody`         | rich text | Yes      | 300 words        | Full abstract (HTML format)                       |
| Submitted By            | `submittedBy`          | string    | Auto     | -                | User ID (from auth token)                         |

### Sub-theme Category Options

```javascript
[
  'Leadership, Governance, and African Ownership in Health Professions Education',
  'Transformative Technologies, AI, and Innovation in Medical Education',
  'Simulation-Based Education and Experiential Learning',
  'Partnerships for Health Workforce and Systems Strengthening',
  'Education for Impact: MNCH, Gender, and Sexual & Reproductive Health',
  'Learners at the Center: Assessment, Accreditation, Research, and Implementation for Change',
];
```

### Presentation Type Options

```javascript
['Oral Presentation', 'Poster Presentation', 'Workshop'];
```

### Request Body Example

```json
{
  "subThemeCategory": "Leadership, Governance, and African Ownership in Health Professions Education",
  "title": "Innovative Leadership Models in African Medical Education",
  "authorInformation": "Dr. Jane Smith, PhD, jane.smith@university.edu, University of Nairobi\nDr. John Doe, MD, john.doe@hospital.org, Kenyatta National Hospital",
  "presentationType": "Oral Presentation",
  "presenterFullName": "Dr. Jane Smith",
  "presenterEmail": "jane.smith@university.edu",
  "presenterPhone": "+254712345678",
  "presenterInstitution": "University of Nairobi",
  "presenterCountry": "Kenya",
  "deanContact": "Dean Prof. Mary Johnson, dean@university.edu, +254711111111",
  "abstractBody": "<p><strong>Background:</strong> Leadership in African medical education requires culturally adapted models...</p>",
  "submittedBy": "user-123"
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "id": "abstract-456",
    "subThemeCategory": "Leadership, Governance, and African Ownership in Health Professions Education",
    "title": "Innovative Leadership Models in African Medical Education",
    "authorInformation": "Dr. Jane Smith, PhD, jane.smith@university.edu, University of Nairobi\nDr. John Doe, MD, john.doe@hospital.org, Kenyatta National Hospital",
    "presentationType": "Oral Presentation",
    "presenterFullName": "Dr. Jane Smith",
    "presenterEmail": "jane.smith@university.edu",
    "presenterPhone": "+254712345678",
    "presenterInstitution": "University of Nairobi",
    "presenterCountry": "Kenya",
    "deanContact": "Dean Prof. Mary Johnson, dean@university.edu, +254711111111",
    "abstractBody": "<p><strong>Background:</strong> Leadership in African medical education...</p>",
    "status": "pending",
    "submittedBy": "user-123",
    "submittedAt": "2024-01-29T10:30:00Z"
  },
  "message": "Abstract submitted successfully"
}
```

---

## 4. Abstract Review/Status Update

**Endpoint:** `PUT /api/abstracts/:id/status`

### Fields

| Field Name  | Input Name   | Type   | Required | Options                                  | Description                        |
| ----------- | ------------ | ------ | -------- | ---------------------------------------- | ---------------------------------- |
| Status      | `status`     | string | Yes      | pending/approved/rejected/info_requested | New status                         |
| Reviewed By | `reviewedBy` | string | Auto     | -                                        | Reviewer user ID (from auth token) |

### Request Body Example

```json
{
  "status": "approved",
  "reviewedBy": "reviewer-123"
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "id": "abstract-456",
    "status": "approved",
    "reviewedBy": "reviewer-123",
    "reviewedAt": "2024-01-29T15:30:00Z"
  },
  "message": "Abstract status updated successfully"
}
```

---

## 5. Add Comment to Abstract

**Endpoint:** `POST /api/abstracts/:id/comments`

### Fields

| Field Name      | Input Name | Type     | Required | Description                        |
| --------------- | ---------- | -------- | -------- | ---------------------------------- |
| Comment Content | `content`  | textarea | Yes      | Comment text                       |
| User ID         | `userId`   | string   | Auto     | Reviewer user ID (from auth token) |
| User Name       | `userName` | string   | Auto     | Reviewer name (from auth token)    |

### Request Body Example

```json
{
  "content": "This is a very interesting study. Could you provide more details about the methodology?",
  "userId": "reviewer-123",
  "userName": "Dr. Emily Johnson"
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "id": "comment-789",
    "abstractId": "abstract-456",
    "userId": "reviewer-123",
    "userName": "Dr. Emily Johnson",
    "content": "This is a very interesting study. Could you provide more details about the methodology?",
    "createdAt": "2024-01-29T15:30:00Z"
  },
  "message": "Comment added successfully"
}
```

---

## 6. Frontend Field Validation Rules

### Registration (Demo Request)

- **Email**: Required, valid email format
- **First Name**: Required
- **Last Name**: Required
- **Phone Number**: Required, valid phone format
- **Company Name**: Required
- **Address**: Required
- **City**: Required
- **Country**: Required
- **Event Name**: Required
- **Expected Attendees**: Required, must be a positive number
- **Needed Services**: Required
- **Comments**: Optional
- **Profile Picture**: Optional, valid URL

### Abstract Submission

- **Sub-theme Category**: Required, must be from dropdown list
- **Title**: Required, max 15 words
- **Author Information**: Required, free text
- **Presentation Type**: Required, must be from dropdown list
- **Presenter Full Name**: Required
- **Presenter Email**: Required, valid email format
- **Presenter Phone**: Required, valid phone format
- **Presenter Institution**: Required
- **Presenter Country**: Required
- **Dean Contact**: Optional, free text
- **Abstract Body**: Required, max 300 words (HTML format)

---

## 7. API Authentication

All authenticated endpoints require:

**Header:**

```
Authorization: Bearer <jwt-token>
```

The JWT token is obtained from login/register and stored in localStorage as `authToken`.

User information is stored in localStorage as `user` (JSON object).

---

## 8. Notes for Backend Development

1. **API Base URL**: `https://api.eventsfactory.rw`

2. **Single Login**: There is only one login form. The backend determines the user's role and permissions, which controls their access level in the frontend.

3. **Registration Flow**: Users Create Account by filling out the registration form. The backend should:
   - Create the user account
   - Assign appropriate role (submitter/reviewer) based on your business logic
   - Return user data with role field
   - Frontend redirects based on role

4. **Email Removed from Abstract Form**: The submitter's email is no longer collected in the abstract form - it comes from the authenticated user's profile.

5. **User ID Association**: The `submittedBy` field should be automatically populated from the authenticated user's ID, not sent from the frontend.

6. **HTML Content**: The `abstractBody` field contains HTML markup from the rich text editor. You may want to sanitize this on the backend.

7. **Word Count Validation**: Frontend validates title (15 words) and abstract body (300 words). Consider adding backend validation as well.

8. **Status Flow**:
   - New abstracts start as `pending`
   - Only reviewers can change status
   - Valid transitions: pending → approved/rejected/info_requested

9. **Case Sensitivity**: All field names use camelCase as shown above.

10. **Role-Based Redirects**: After login, the frontend redirects users based on their role:
    - Reviewers → `/dashboard`
    - Submitters → `/submit`
