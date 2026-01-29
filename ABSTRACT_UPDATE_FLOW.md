# Abstract Update Flow - Visual Guide

## 🔄 Complete Update Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ABSTRACT UPDATE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1️⃣ USER NAVIGATES TO SUBMISSION
   ↓
   /my-submissions → Click abstract → /submission/[id]

2️⃣ PERMISSION CHECK (Frontend)
   ↓
   ┌─────────────────────────────────────┐
   │ Is user the owner?                  │
   │ Status NOT approved/rejected?       │
   └─────────────────────────────────────┘
          │
          ├── ✅ YES → Show "Edit Abstract" button
          │
          └── ❌ NO  → Hide button

3️⃣ USER CLICKS "EDIT ABSTRACT"
   ↓
   Navigate to /edit-abstract/[id]

4️⃣ LOAD ABSTRACT DATA
   ↓
   GET /abstracts/:id
   │
   ├── ✅ Success → Populate form with current data
   │
   └── ❌ Error → Show error message + redirect

5️⃣ PERMISSION VALIDATION (on page load)
   ↓
   Check:
   - User is owner/co-author?
   - Status allows editing?
   │
   ├── ✅ PASS → Show edit form
   │
   └── ❌ FAIL → Show error + "Back to Submissions" button

6️⃣ USER EDITS FORM
   ↓
   Real-time validation:
   - Title word count (max 15)
   - Abstract body word count (max 300)
   - Required fields filled

7️⃣ USER CLICKS "SAVE CHANGES"
   ↓
   Client-side validation
   │
   ├── ❌ FAIL → Show error message
   │
   └── ✅ PASS → Continue

8️⃣ API REQUEST
   ↓
   PUT /abstracts/:id
   │
   Request Body: {
     subThemeCategory,
     title,
     authorInformation,
     presentationType,
     presenterFullName,
     presenterEmail,
     presenterPhone,
     presenterInstitution,
     presenterCountry,
     deanContact,
     abstractBody
   }

9️⃣ BACKEND VALIDATION
   ↓
   Check:
   - User authentication ✓
   - User is owner/co-author ✓
   - Status allows editing ✓
   - Field validation ✓
   │
   ├── ❌ FAIL → Return error (403, 400, 404)
   │
   └── ✅ PASS → Update database

🔟 DATABASE UPDATE
   ↓
   UPDATE abstracts SET
     subThemeCategory = ?,
     title = ?,
     ... (all fields)
   WHERE id = ?

1️⃣1️⃣ CHANGE HISTORY RECORDED
   ↓
   INSERT INTO abstract_history (
     abstractId,
     changedBy,
     changeType: 'updated',
     previousValues: {...},
     newValues: {...},
     createdAt
   )

1️⃣2️⃣ SUCCESS RESPONSE
   ↓
   Return updated Abstract object

1️⃣3️⃣ FRONTEND UPDATE
   ↓
   - Show success message
   - Wait 2 seconds
   - Redirect to /submission/[id]

1️⃣4️⃣ VIEW UPDATED ABSTRACT
   ↓
   - User sees updated content
   - Change history reflects modifications
   - Changelog shows field-level diffs
```

## 📋 Permission Matrix

| User Type | Status | Can Edit? | Button Shown? |
|-----------|--------|-----------|---------------|
| Owner | pending | ✅ YES | ✅ YES |
| Owner | more_info_requested | ✅ YES | ✅ YES |
| Owner | approved | ❌ NO | ❌ NO |
| Owner | rejected | ❌ NO | ❌ NO |
| Co-author | pending | ✅ YES* | ✅ YES* |
| Co-author | more_info_requested | ✅ YES* | ✅ YES* |
| Co-author | approved | ❌ NO | ❌ NO |
| Co-author | rejected | ❌ NO | ❌ NO |
| Other user | any | ❌ NO | ❌ NO |

*Co-author functionality is implemented in API but frontend co-author check needs enhancement

## 🎯 Key Decision Points

### 1. Should "Edit" Button Show?
```typescript
const canEdit = (
  isOwner &&
  abstract.status !== 'approved' &&
  abstract.status !== 'rejected'
)
```

### 2. Should Edit Page Load?
```typescript
// Check 1: User authentication
if (!token || !user) {
  redirect('/auth/login')
}

// Check 2: User permission
if (abstract.submittedBy !== currentUser.email) {
  showError('You can only edit abstracts you submitted')
}

// Check 3: Status check
if (abstract.status === 'approved' || abstract.status === 'rejected') {
  showError(`Cannot edit an abstract that has been ${status}`)
}
```

### 3. Should Form Submit?
```typescript
// Word count validation
if (countWords(title) > 15) {
  showError('Title must be maximum 15 words')
  return
}

if (countWords(stripHtml(abstractBody)) > 300) {
  showError('Abstract body must be maximum 300 words')
  return
}

// Required fields
if (!allRequiredFieldsFilled()) {
  showError('Please fill in all required fields')
  return
}

// All checks passed - submit!
```

## 🔐 Security Layers

```
┌──────────────────────────────────────────┐
│         SECURITY VALIDATION              │
├──────────────────────────────────────────┤
│ Layer 1: UI Button Visibility           │
│ • Hide button if can't edit             │
│ • Prevent navigation to edit page       │
├──────────────────────────────────────────┤
│ Layer 2: Route Protection                │
│ • Check auth token on page load         │
│ • Verify user owns/co-authors abstract  │
│ • Verify status allows editing          │
├──────────────────────────────────────────┤
│ Layer 3: API Authorization               │
│ • Verify JWT token                      │
│ • Check user is owner/co-author         │
│ • Verify status is editable             │
├──────────────────────────────────────────┤
│ Layer 4: Database Constraints            │
│ • Foreign key constraints               │
│ • Data type validation                  │
│ • Field length limits                   │
└──────────────────────────────────────────┘
```

## 📱 User Experience Flow

### Scenario 1: Owner Edits Pending Abstract

```
Owner → My Submissions → Click Abstract
  ↓
View Detail Page
  [Edit Abstract] button visible ✅
  ↓
Click [Edit Abstract]
  ↓
Edit Form Loads (all fields populated)
  ↓
Modify title and abstract body
  ↓
Click [Save Changes]
  ↓
✅ Success! "Abstract updated successfully!"
  ↓
Auto-redirect to detail page (2 sec delay)
  ↓
View updated abstract
Change history shows modification
```

### Scenario 2: Owner Tries to Edit Approved Abstract

```
Owner → My Submissions → Click Approved Abstract
  ↓
View Detail Page
  [Edit Abstract] button NOT visible ❌
  Green banner: "Congratulations! Your abstract has been approved"
  ↓
Cannot edit (as expected)
```

### Scenario 3: Reviewer Requests More Info

```
Staff reviews abstract → Clicks [Request More Info]
  ↓
Owner receives notification
  ↓
Owner → My Submissions → Click Abstract
  ↓
View Detail Page
  Yellow alert: "⚠️ Action Required"
  [Edit Abstract Now] button in alert ✅
  ↓
Click [Edit Abstract Now]
  ↓
Edit Form with special alert
  "Reviewer Requested More Information"
  ↓
Check reviewer comments
Update abstract accordingly
  ↓
Click [Save Changes]
  ↓
✅ Updated! Changes sent for review
```

### Scenario 4: Non-Owner Tries Direct URL

```
User types: /edit-abstract/123
  ↓
Page loads, fetches abstract
  ↓
Permission check fails
  ↓
❌ Error: "You can only edit abstracts you submitted"
  [Back to My Submissions] button
  ↓
Cannot access edit form (secure!)
```

## 🎨 UI States

### Edit Button States

#### 1. Enabled (Can Edit)
```
┌─────────────────────┐
│   Edit Abstract     │  ← Blue button, clickable
└─────────────────────┘
```

#### 2. Hidden (Cannot Edit)
```
(No button shown)      ← Button not rendered
```

### Form States

#### 1. Loading
```
┌─────────────────────────────────────┐
│  Loading abstract...                │
└─────────────────────────────────────┘
```

#### 2. Ready to Edit
```
┌─────────────────────────────────────┐
│  Edit Abstract                      │
│  Status: pending                    │
│  ─────────────────────────────────  │
│  [Form fields with current data]    │
│  [Save Changes] [Cancel]            │
└─────────────────────────────────────┘
```

#### 3. Saving
```
┌─────────────────────────────────────┐
│  [Saving Changes...] (disabled)     │
└─────────────────────────────────────┘
```

#### 4. Success
```
┌─────────────────────────────────────┐
│  ✅ Abstract updated successfully!  │
│     Redirecting...                  │
└─────────────────────────────────────┘
```

#### 5. Error
```
┌─────────────────────────────────────┐
│  ❌ Title must be maximum 15 words  │
│  [Form still editable]              │
└─────────────────────────────────────┘
```

## 📊 Change Tracking

### What Gets Recorded

```typescript
AbstractHistory {
  id: 15,
  abstractId: 123,
  changedBy: "user@example.com",
  changeType: "updated",
  previousValues: {
    title: "Old Title",
    abstractBody: "<p>Old content</p>"
  },
  newValues: {
    title: "New Title",
    abstractBody: "<p>New content</p>"
  },
  createdAt: "2026-01-29T15:30:00Z"
}
```

### Changelog Display

```
┌──────────────────────────────────────────┐
│ Change History                           │
│ [Current Version] [Full History (3)]    │
├──────────────────────────────────────────┤
│ ⚪ Updated by user@example.com           │
│    Jan 29, 2026 3:30 PM                 │
│                                          │
│    Title                                 │
│    Old: Old Title                        │
│    New: New Title                        │
│                                          │
│    Abstract Body                         │
│    Old: Old content                      │
│    New: New content                      │
└──────────────────────────────────────────┘
```

## 🚀 Quick Reference

### Code Locations
- **Edit Page**: `app/edit-abstract/[id]/page.tsx`
- **Detail Page**: `app/submission/[id]/page.tsx`
- **API Client**: `lib/api.ts` → `abstractsApi.update()`
- **Types**: `lib/types.ts` → `Abstract`

### Key Functions
```typescript
// Fetch abstract for editing
abstractsApi.getById(id: number)

// Update abstract
abstractsApi.update(id: number, data: Partial<Abstract>)

// Check permissions
const canEdit = isOwner && !['approved', 'rejected'].includes(status)
```

### Navigation Routes
```
View: /submission/[id]
Edit: /edit-abstract/[id]
List: /my-submissions
```

---

**Created**: January 29, 2026
**Last Updated**: January 29, 2026
**Version**: 1.0
