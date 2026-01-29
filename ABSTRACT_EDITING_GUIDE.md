# Abstract Editing Guide

## Overview
This guide explains how abstract editing works in the Abstract Management System, including permissions, workflow, and technical implementation.

## User Workflow

### When Can Users Edit Their Abstracts?

Users can edit their abstracts when **ALL** of the following conditions are met:

1. ✅ They are the **owner** (submitter) of the abstract OR a **co-author**
2. ✅ The abstract status is **NOT** `approved` or `rejected`

Valid statuses for editing:
- `pending` - Abstract is awaiting review
- `more_info_requested` - Reviewer requested additional information

Invalid statuses for editing:
- `approved` - Abstract has been approved (final)
- `rejected` - Abstract has been rejected (final)

### How to Edit an Abstract

#### Method 1: From Submission Detail Page
1. Navigate to **My Submissions** from the header
2. Click on any abstract to view details
3. Click the **"Edit Abstract"** button in the top-right corner
4. Make your changes and click **"Save Changes"**

#### Method 2: When More Info is Requested
1. When a reviewer requests more information, you'll see a yellow alert banner
2. Click **"Edit Abstract Now"** button in the alert
3. Review the comments to see what information is needed
4. Update your abstract accordingly
5. Save your changes

### What Can Be Edited?

All abstract fields can be modified:

#### Required Fields:
- Sub-Theme Category (dropdown)
- Abstract Title (max 15 words)
- Author Information
- Presentation Type (Oral/Poster/Workshop)
- Presenter's Full Name
- Presenter's Email Address
- Presenter's Phone Number
- Presenter's Affiliated Institution
- Country
- Abstract Body (max 300 words)

#### Optional Fields:
- Dean/Provost Contact Information

## Technical Implementation

### Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/edit-abstract/[id]` | Edit abstract form | Owner/Co-author (if status allows) |
| `/submission/[id]` | View abstract details with edit button | Owner/Co-author |

### API Integration

#### Endpoint Used
```
PUT /abstracts/:id
```

#### Request Payload
All abstract fields are sent in the request body:
```typescript
{
  subThemeCategory: 'THEME_1' | 'THEME_2' | ...,
  title: string,
  authorInformation: string,
  presentationType: 'Oral' | 'Poster' | 'Workshop',
  presenterFullName: string,
  presenterEmail: string,
  presenterPhone: string,
  presenterInstitution: string,
  presenterCountry: string,
  deanContact?: string,
  abstractBody: string
}
```

#### Response
```typescript
{
  message: "Abstract updated successfully",
  data: Abstract
}
```

#### Error Responses
- **403 Forbidden**: User is not the owner/co-author, OR abstract status is approved/rejected
- **404 Not Found**: Abstract doesn't exist
- **400 Bad Request**: Validation errors (word count, required fields, etc.)

### Permission Checks

#### Frontend Validation
The edit page performs client-side checks:
```typescript
// Check if user is owner
if (abstract.submittedBy !== currentUser.email) {
  // Show error: "You can only edit abstracts you submitted or co-author"
  return
}

// Check if status allows editing
if (abstract.status === 'approved' || abstract.status === 'rejected') {
  // Show error: "Cannot edit an abstract that has been {status}"
  return
}
```

#### Backend Validation
The API enforces the same rules server-side for security.

### Form Validation

#### Title Validation
- Maximum: **15 words**
- Words are counted by splitting on whitespace
- Error message shown if exceeded

#### Abstract Body Validation
- Maximum: **300 words**
- HTML tags are stripped before counting
- Real-time word count displayed
- Error message shown if exceeded

#### Required Field Validation
- All required fields must be filled
- Email format validation
- Phone number format (basic validation)

## User Interface

### Edit Button Visibility

The "Edit Abstract" button only appears when:
```typescript
isOwner &&
abstract.status !== 'approved' &&
abstract.status !== 'rejected'
```

**Button Location**: Top-right corner of the submission detail page header

### Status-Based UI Elements

#### Pending Status
- Standard edit button
- No special alerts

#### More Info Requested Status
- Yellow alert banner with prominent "Edit Abstract Now" button
- Alert text: "The reviewer has requested additional information..."
- Direct link to edit page

#### Approved Status
- No edit button
- Green success banner
- Message: "Congratulations! Your abstract has been approved..."

#### Rejected Status
- No edit button
- Red alert banner
- Message: "Your abstract was not accepted at this time..."

### Edit Page Layout

```
┌─────────────────────────────────────────┐
│ Header                                   │
│ ┌───────────────────┐ ┌──────────────┐ │
│ │ Edit Abstract     │ │ Cancel       │ │
│ │ Status: pending   │ └──────────────┘ │
│ └───────────────────┘                   │
├─────────────────────────────────────────┤
│ [Alert if more_info_requested]          │
├─────────────────────────────────────────┤
│ Form Fields:                            │
│ • Sub-Theme Category (dropdown)         │
│ • Title (with word count)               │
│ • Author Information                    │
│ • Presentation Type (dropdown)          │
│ • Presenter Details                     │
│ • Abstract Body (rich text editor)      │
│                                         │
│ ┌─────────────┐ ┌──────────────┐      │
│ │ Save Changes│ │ Cancel       │       │
│ └─────────────┘ └──────────────┘      │
└─────────────────────────────────────────┘
```

## Change Tracking

### What Gets Tracked?
When an abstract is updated, the system tracks:
- **Who** made the change (user email)
- **When** the change was made (timestamp)
- **What** was changed (field-level diffs)
- **Change type**: `updated`

### Viewing Change History
Users can view the complete change history:
1. Go to the submission detail page
2. Scroll down to the **Change History** section
3. Toggle between:
   - **Current Version**: Shows latest status
   - **Full History**: Shows all changes with before/after comparisons

### Change Display Format
- **Old values**: Red background with strikethrough
- **New values**: Green background
- **Attribution**: Shows who made each change
- **Timestamps**: Full date and time for each modification

## Co-Author Editing

### Current Implementation
Co-authors are invited but need to:
1. Have an account in the system
2. Be invited via email to the abstract

### Future Enhancement
Planned features for co-author editing:
- [ ] Check if user is in co-authors list
- [ ] Allow co-authors to edit (same rules as owner)
- [ ] Track which co-author made each change
- [ ] Notify owner when co-author edits

## Best Practices

### For Users

1. **Check reviewer comments first** before editing (especially if more info requested)
2. **Save frequently** if making major changes
3. **Review word counts** before submitting
4. **Read the change history** to see what reviewers or co-authors modified

### For Developers

1. **Always validate permissions** on both frontend and backend
2. **Track all changes** in the history table
3. **Show clear error messages** when editing is not allowed
4. **Preserve formatting** in rich text editor content
5. **Test edge cases**:
   - Concurrent editing by owner and co-author
   - Status changes during edit session
   - Network failures during save

## Error Messages

| Scenario | Error Message |
|----------|---------------|
| Not owner/co-author | "You can only edit abstracts you submitted or co-author" |
| Status is approved | "Cannot edit an abstract that has been approved" |
| Status is rejected | "Cannot edit an abstract that has been rejected" |
| Title too long | "Title must be maximum 15 words" |
| Abstract body too long | "Abstract body must be maximum 300 words" |
| Missing required fields | "Please fill in all required fields" |
| Network error | "An error occurred. Please try again." |

## Success Flow

```
User clicks "Edit Abstract"
  ↓
System checks permissions
  ↓
Edit form loads with current data
  ↓
User makes changes
  ↓
Form validation runs
  ↓
PUT request to /abstracts/:id
  ↓
Backend validates and updates
  ↓
Change history recorded
  ↓
Success message shown
  ↓
Redirect to submission detail page
```

## Related Files

### New Files Created
- [`app/edit-abstract/[id]/page.tsx`](app/edit-abstract/[id]/page.tsx) - Edit form page

### Modified Files
- [`app/submission/[id]/page.tsx`](app/submission/[id]/page.tsx) - Added edit button
- [`lib/api.ts`](lib/api.ts) - Already had `update()` method

### Reused Components
- `RichTextEditor` - For abstract body editing
- `Header` - Site-wide navigation
- `Footer` - Site-wide footer

## Testing Checklist

### Functional Testing
- [ ] Edit button appears for pending abstracts
- [ ] Edit button appears for more_info_requested abstracts
- [ ] Edit button does NOT appear for approved abstracts
- [ ] Edit button does NOT appear for rejected abstracts
- [ ] Non-owners cannot access edit page directly
- [ ] Form loads with current abstract data
- [ ] All fields can be modified
- [ ] Word count validation works for title
- [ ] Word count validation works for abstract body
- [ ] Changes are saved successfully
- [ ] User is redirected after successful save
- [ ] Change history is updated after edit
- [ ] Error messages display correctly

### Permission Testing
- [ ] Owner can edit pending abstract
- [ ] Owner can edit more_info_requested abstract
- [ ] Owner cannot edit approved abstract
- [ ] Owner cannot edit rejected abstract
- [ ] Non-owner sees permission error

### UI/UX Testing
- [ ] Edit button is visible and accessible
- [ ] Form is responsive on mobile
- [ ] Rich text editor loads correctly
- [ ] Word counters update in real-time
- [ ] Cancel button works correctly
- [ ] Success message appears after save
- [ ] Error messages are clear and helpful

## API Reference

### Update Abstract
```typescript
abstractsApi.update(id: number, data: Partial<Abstract>)
```

**Parameters:**
- `id` - Abstract ID
- `data` - Object containing fields to update

**Returns:**
```typescript
ApiResponse<Abstract>
```

**Example:**
```typescript
const response = await abstractsApi.update(123, {
  title: "Updated Title",
  abstractBody: "<p>Updated content...</p>"
})

if (response.data) {
  console.log("Update successful", response.data)
} else {
  console.error("Update failed", response.message)
}
```

## Future Enhancements

### Planned Features
1. **Auto-save** - Periodically save draft changes
2. **Version comparison** - Side-by-side diff view
3. **Collaborative editing** - Real-time co-author collaboration
4. **Comment integration** - Inline comments from reviewers
5. **Edit notifications** - Notify co-authors when abstract is edited
6. **Revision approval** - Owner must approve co-author changes

### Technical Improvements
1. Implement optimistic updates
2. Add offline editing support
3. Implement conflict resolution for concurrent edits
4. Add undo/redo functionality
5. Improve rich text editor features (formatting toolbar)

---

**Last Updated**: January 29, 2026
**Version**: 1.0
