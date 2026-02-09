# Abstract Service API — Role-Based Access Control

## Roles

| Role | Flags | Description |
|------|-------|-------------|
| **Super Admin** | `isSuperAdmin: true`, `isStaff: true` | Full access to all abstracts and all actions |
| **Staff** | `isStaff: true`, `isSuperAdmin: false` | Access limited to abstracts in assigned topics only |
| **Normal User** | `isStaff: false`, `isSuperAdmin: false` | Access limited to own + co-authored abstracts |

---

## Staff Topic Management (Super Admin only)

### List all staff members

```
GET /auth/staff
Authorization: Bearer <super_admin_token>
```

**Response 200:**
```json
{
  "message": "Staff members retrieved successfully",
  "data": [
    {
      "id": 5,
      "email": "reviewer1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isStaff": true,
      "isSuperAdmin": false,
      "topicAssignments": [
        { "id": 1, "userId": 5, "topic": "AI & Machine Learning", "createdAt": "...", "updatedAt": "..." },
        { "id": 2, "userId": 5, "topic": "Data Science", "createdAt": "...", "updatedAt": "..." }
      ]
    }
  ]
}
```

**Error 403:** Not a super admin.

---

### Get topics assigned to a staff member

```
GET /auth/staff/:userId/topics
Authorization: Bearer <super_admin_token>
```

**Response 200:**
```json
{
  "message": "Staff topics retrieved successfully",
  "data": [
    { "id": 1, "userId": 5, "topic": "AI & Machine Learning", "createdAt": "...", "updatedAt": "..." }
  ]
}
```

**Error 403:** Not a super admin.
**Error 404:** Staff member not found (invalid userId or user is not staff).

---

### Assign a topic to a staff member

```
POST /auth/staff/:userId/topics
Authorization: Bearer <super_admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "topic": "AI & Machine Learning"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | Yes | Must match a `subThemeCategory` value used in abstracts (exact match, case-sensitive) |

**Response 201:**
```json
{
  "message": "Topic assigned to staff successfully",
  "data": { "id": 1, "userId": 5, "topic": "AI & Machine Learning", "createdAt": "...", "updatedAt": "..." }
}
```

**Error 403:** Not a super admin.
**Error 404:** Staff member not found.
**Error 409:** Topic already assigned to this staff member.

---

### Remove a topic from a staff member

```
DELETE /auth/staff/:userId/topics/:topic
Authorization: Bearer <super_admin_token>
```

**Example:** `DELETE /auth/staff/5/topics/AI%20%26%20Machine%20Learning`

> Note: URL-encode the topic name if it contains special characters (`&` → `%26`, spaces → `%20`).

**Response 200:**
```json
{
  "message": "Topic removed from staff successfully"
}
```

**Error 403:** Not a super admin.
**Error 404:** Topic assignment not found.

---

### Invite staff (updated)

```
POST /auth/invite-staff
Authorization: Bearer <super_admin_token>
```

> **Breaking change:** Previously any staff could invite other staff. Now only super admins can.

**Error 403:** `"Only super admins can invite staff members"`

---

## Abstract Endpoints — Access Control Matrix

### List abstracts

```
GET /abstracts
Authorization: Bearer <token>
```

| Role | Behavior |
|------|----------|
| Super Admin | Returns all abstracts |
| Staff | Returns only abstracts where `subThemeCategory` matches an assigned topic. Returns empty array `[]` if no topics assigned. |
| Normal User | Returns own abstracts + co-authored abstracts |

---

### Get single abstract

```
GET /abstracts/:id
Authorization: Bearer <token>
```

| Role | Behavior |
|------|----------|
| Super Admin | Can view any abstract |
| Staff | Can view only if abstract's `subThemeCategory` is in their assigned topics. Otherwise **403**. |
| Normal User | Can view only if owner or co-author. Otherwise **403**. |

**Error 403 (staff):** `"You do not have access to abstracts in this topic"`

---

### Approve abstract (Super Admin only)

```
PATCH /abstracts/:id/approve
Authorization: Bearer <super_admin_token>
Content-Type: application/json
```

```json
{
  "note": "Well done",
  "points": 9
}
```

| Role | Behavior |
|------|----------|
| Super Admin | Allowed. Notification sent to submitter. |
| Staff | **403 Forbidden** |
| Normal User | **403 Forbidden** |

**Error 403:** `"Only super admins can approve abstracts"`

---

### Reject abstract (Super Admin only)

```
PATCH /abstracts/:id/reject
Authorization: Bearer <super_admin_token>
Content-Type: application/json
```

```json
{
  "note": "Does not meet criteria"
}
```

| Role | Behavior |
|------|----------|
| Super Admin | Allowed. Notification sent to submitter. |
| Staff | **403 Forbidden** |
| Normal User | **403 Forbidden** |

**Error 403:** `"Only super admins can reject abstracts"`

---

### Request more info

```
PATCH /abstracts/:id/request-more-info
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "note": "Please provide more details on methodology"
}
```

| Role | Behavior | Notification sent? |
|------|----------|--------------------|
| Super Admin | Allowed on any abstract | Yes |
| Staff | Allowed only if abstract's topic is in their assigned topics | **No** |
| Normal User | **403 Forbidden** | — |

**Error 403 (staff, wrong topic):** `"You do not have access to abstracts in this topic"`

---

## Comments — Access Control

### Create comment

```
POST /abstract-comments
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "abstractId": 1,
  "comment": "Consider revising section 3"
}
```

| Role | Behavior |
|------|----------|
| Super Admin | Can comment on any abstract |
| Staff | Can comment only on abstracts in their assigned topics. Otherwise **403**. |
| Normal User | Can comment only on own abstracts. Otherwise **403**. |

---

## Frontend Implementation Notes

### Determining user role from JWT

The JWT token payload contains:
```json
{
  "id": 1,
  "email": "user@example.com",
  "isStaff": true,
  "isSuperAdmin": false,
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": null
  }
}
```

Use these flags to conditionally render UI:

| Condition | Role |
|-----------|------|
| `isSuperAdmin === true` | Super Admin |
| `isStaff === true && isSuperAdmin === false` | Staff |
| `isStaff === false` | Normal User |

### UI recommendations

- **Super Admin dashboard:** Show "Staff Management" section with topic assignment UI. Show approve/reject buttons on abstracts.
- **Staff dashboard:** Show only assigned abstracts. Show "Request More Info" button only (hide approve/reject). Show assigned topics in profile/sidebar.
- **Normal User dashboard:** Show own abstracts only with edit capabilities.
- **Topic assignment UI:** Provide a way for super admin to select staff → select topics → assign. The topic values must match the `subThemeCategory` strings used when creating abstracts.
