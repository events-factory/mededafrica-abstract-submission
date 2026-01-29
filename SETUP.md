# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Step 3: Run the Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Step 4: Build for Production

```bash
npm run build
npm run start
```

## Features Overview

### Home Page (/)
- Landing page with two options:
  - Submit Abstract (for submitters)
  - Review Abstracts (for reviewers)
- Links to login and registration for both user types

### For Submitters

1. **Register** at `/auth/register?role=submitter`
   - Provide name, email, and password
   - Creates a submitter account

2. **Login** at `/auth/login?role=submitter`
   - Enter email and password
   - Redirects to submission form

3. **Submit Abstract** at `/submit`
   - Fill out complete form with:
     - Email
     - Sub-Theme Category (dropdown)
     - Title (max 15 words)
     - Author Information
     - Presentation Type (dropdown)
     - Presenter details (name, email, phone, institution, country)
     - Optional Dean/Provost contact
     - Abstract Body (rich text editor, max 300 words)
   - Word count validation
   - Success page after submission

### For Reviewers

1. **Register** at `/auth/register?role=reviewer`
   - Provide name, email, and password
   - Creates a reviewer account

2. **Login** at `/auth/login?role=reviewer`
   - Enter email and password
   - Redirects to dashboard

3. **Dashboard** at `/dashboard`
   - View all submitted abstracts in a table
   - Filter by status:
     - All
     - Pending
     - Approved
     - Rejected
     - Info Requested
   - Click "Review" to see details

4. **Review Abstract** at `/abstracts/[id]`
   - View complete abstract details:
     - Basic information
     - Presenter details
     - Full abstract body (rendered HTML)
   - Add comments
   - Action buttons:
     - Approve
     - Request Info
     - Reject
   - View all comments on the abstract

## UI/UX Features

- **Brand Colors**: Custom color scheme using #165fac, #52b2e4, #bbd758, #ef4545
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Rich Text Editor**: CKEditor 5 with formatting toolbar
- **Word Count**: Real-time word count for title and abstract body
- **Form Validation**: Client-side validation with clear error messages
- **Status Badges**: Color-coded status indicators
- **Smooth Transitions**: Hover effects and smooth animations

## Technical Details

### Technologies Used
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- CKEditor 5
- React 19

### Authentication
- Token-based authentication using localStorage
- Role-based access control (submitter vs reviewer)
- Protected routes with automatic redirects

### API Integration
- Centralized API client in `lib/api.ts`
- Type-safe with TypeScript interfaces in `lib/types.ts`
- Bearer token authentication
- Error handling with user-friendly messages

### File Structure
```
app/
├── abstracts/[id]/page.tsx    # Abstract detail page
├── auth/
│   ├── login/page.tsx         # Login page
│   └── register/page.tsx      # Registration page
├── dashboard/page.tsx         # Reviewer dashboard
├── submit/
│   ├── page.tsx               # Submission form
│   └── success/page.tsx       # Success page
├── globals.css                # Global styles
├── layout.tsx                 # Root layout
└── page.tsx                   # Home page

components/
└── RichTextEditor.tsx         # CKEditor wrapper

lib/
├── api.ts                     # API client
└── types.ts                   # TypeScript types
```

## Next Steps

1. Implement the backend API according to [API_ENDPOINTS.md](./API_ENDPOINTS.md)
2. Update the `NEXT_PUBLIC_API_URL` in `.env.local`
3. Test all functionality:
   - User registration and login
   - Abstract submission
   - Abstract review workflow
   - Comment functionality
   - Status updates

## Troubleshooting

### CKEditor not loading
- Make sure you're using Node.js 18+
- Clear the `.next` folder and rebuild: `rm -rf .next && npm run dev`

### API calls failing
- Check that `NEXT_PUBLIC_API_URL` is set correctly in `.env.local`
- Verify backend API is running
- Check browser console for detailed error messages

### Authentication issues
- Clear localStorage: Open browser DevTools > Application > Local Storage > Clear
- Check that the API returns the correct token format

## Support

For questions or issues, please refer to:
- [README.md](./README.md) - Full documentation
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API specification
