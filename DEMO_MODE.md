# Demo Mode - Testing Without Backend

The application now includes a **Demo Mode** that allows you to test all features without setting up a backend API.

## How to Use Demo Mode

### 1. Access the Application
Open your browser and go to [http://localhost:3000](http://localhost:3000)

### 2. Test as a Submitter

1. Click on **"Submit Abstract"** card on the home page
2. On the login or register page, click the **"Demo Mode"** button
3. You'll be redirected to the submission form
4. Fill out the abstract submission form with all required fields
5. Submit your abstract (it will be saved locally for demo purposes)
6. Click **"View My Submissions"** to see your submitted abstracts and their status

### 3. Test as a Reviewer

1. Go back to home page (or open in a new browser tab)
2. Click on **"Review Abstracts"** card
3. On the login or register page, click the **"Demo Mode"** button
4. You'll be redirected to the reviewer dashboard

### 4. Features You Can Test in Demo Mode

#### Dashboard (Reviewer)
- View 6 sample abstracts with different statuses:
  - Pending
  - Approved
  - Rejected
  - Info Requested
- Filter abstracts by status
- Click "Review" to view abstract details

#### Abstract Detail Page (Reviewer)
- View complete abstract information:
  - Title, category, presentation type
  - Author information
  - Presenter details
  - Full abstract body with formatting
- **Add comments** - Comments are saved locally
- **Change status** - Click Approve, Reject, or Request Info buttons
  - Status changes are reflected immediately
  - A confirmation dialog appears for each action
- **View existing comments** - Sample comments are provided for some abstracts

#### Abstract Submission (Submitter)
- Fill out all form fields
- Use the custom rich text editor for the abstract body with formatting options
- Real-time word count validation (15 words max for title, 300 words max for body)
- Form validation for all required fields

#### My Submissions (Submitter)
- View all your submitted abstracts in one place
- See the current status of each submission:
  - Pending Review
  - Approved
  - Rejected
  - Information Requested
- Filter submissions by status
- Click on any submission to view full details
- View reviewer comments on your abstracts
- Get notifications for abstracts requiring additional information

## Sample Abstracts Available

1. **Innovative Leadership Models in African Medical Education** (Pending)
2. **AI-Powered Simulation for Medical Training** (Approved)
3. **Virtual Reality Clinical Skills Training** (Info Requested)
4. **Community-University Partnerships for Rural Health** (Rejected)
5. **Gender-Sensitive Maternal Health Education** (Pending)
6. **Competency-Based Assessment in Medical Education** (Approved)

## Demo Mode Features

- ✅ **No backend required** - All data is stored locally
- ✅ **Full functionality** - All features work as they would with a real API
- ✅ **Persistent during session** - Data persists during your browsing session
- ✅ **Comments and status updates** - Changes are reflected immediately
- ✅ **Multiple user roles** - Test both submitter and reviewer workflows

## Testing Workflow

### Complete Testing Scenario

1. **As a Submitter:**
   - Login with Demo Mode
   - Submit a new abstract
   - See the success page
   - Click "View My Submissions" to see your abstracts
   - Click on a submission to view details and comments
   - Check the status of your submissions (Pending, Approved, etc.)

2. **As a Reviewer (in a new tab or after logout):**
   - Login with Demo Mode as a reviewer
   - View all abstracts in the dashboard
   - Filter by different statuses
   - Click to review an abstract
   - Add a comment
   - Change the status (Approve/Reject/Request Info)
   - View the updated status

3. **Full Workflow Test:**
   - Submit an abstract as a submitter
   - Log out and login as a reviewer
   - Review the abstract and add comments
   - Change the status to "Info Requested"
   - Log out and login as the submitter
   - View your submission and see the reviewer's comments
   - See the status change notification

## Limitations of Demo Mode

- Data is **not persistent** - Refreshing the page will reset to sample data
- **No actual API calls** - All operations are simulated locally
- **No real authentication** - Anyone can access with demo mode
- **No database storage** - Data exists only in browser memory/localStorage

## Moving to Production

When you're ready to use the real backend:

1. Implement the API endpoints as specified in [API_ENDPOINTS.md](./API_ENDPOINTS.md)
2. Update `.env.local` with your actual API URL
3. The application will automatically use the real API instead of mock data
4. Demo mode buttons can be removed or hidden in production

## Troubleshooting

### Demo mode not working?
- Clear your browser cache and localStorage
- Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)
- Check browser console for any errors

### Can't see sample abstracts?
- Make sure you're logged in as a **reviewer** in demo mode
- Check that the dev server is running (`npm run dev`)

### Styles not loading?
- Clear `.next` folder: `rm -rf .next`
- Restart the dev server: `npm run dev`

## Browser Developer Tools

To inspect demo mode data:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Check Local Storage
4. Look for:
   - `authToken` - Demo authentication token
   - `user` - Demo user information

## Questions?

For more information, see:
- [README.md](./README.md) - Full documentation
- [SETUP.md](./SETUP.md) - Setup guide
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API specification
