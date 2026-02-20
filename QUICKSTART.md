# 🚀 YSP Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Firebase

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com
   - Click "Add project"
   - Name it "YSP Volunteer System"
   - Disable Google Analytics (optional)

2. **Enable Authentication**
   - In Firebase Console, go to **Authentication**
   - Click "Get Started"
   - Click "Sign-in method" tab
   - Enable "Email/Password"
   - Click "Save"

3. **Create Firestore Database**
   - Go to **Firestore Database**
   - Click "Create database"
   - Start in **test mode** (for development)
   - Choose your region (preferably close to Philippines)
   - Click "Enable"

4. **Get Firebase Config**
   - Go to Project Settings (gear icon) → General
   - Scroll to "Your apps" section
   - Click the web icon `</>`
   - Register your app (name it "YSP Web")
   - Copy the firebaseConfig object

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Open `.env.local` and paste your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxx
```

### Step 4: Run the Application
```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## First-Time Setup

### Create Your Admin Account

1. **Register a New Account**
   - Go to http://localhost:3000/auth/register
   - Fill in your details
   - Choose any chapter
   - Click "Create Account"

2. **Make Yourself Admin**
   - Go to Firebase Console → Firestore Database
   - Find the `volunteers` collection
   - Click on your user document
   - Edit these fields:
     - `role`: Change "Volunteer" to "Admin"
     - `status`: Change "pending" to "approved"
   - Save

3. **Log Out and Log Back In**
   - You now have admin access!

### Create Your First Project

1. **Go to Admin Dashboard**
   - Navigate to http://localhost:3000/dashboard/admin
   
2. **Create a Test Project** (manually in Firestore for now):
   - Go to Firebase Console → Firestore
   - Create a new collection called `projects`
   - Add a document with these fields:
   ```json
   {
     "name": "Tree Planting - Cebu",
     "description": "Join us in planting 100 trees along the coastal areas of Cebu",
     "chapter": "Cebu",
     "status": "open",
     "applicants": [],
     "assignedVolunteers": []
   }
   ```

3. **Test the Volunteer Flow**
   - Create another account (different email)
   - Browse projects at http://localhost:3000/projects
   - Apply to the project
   - Switch to admin account
   - View applications in dashboard

## Common Issues & Solutions

### Issue: Firebase errors on startup
**Solution**: Double-check your `.env.local` file has all the correct values from Firebase

### Issue: "Permission denied" errors
**Solution**: Make sure Firestore is in "test mode" (for development)

### Issue: Can't see dashboard
**Solution**: Make sure you're logged in and your role is set correctly in Firestore

### Issue: Dark mode not working
**Solution**: Clear your browser cache and reload

## What's Next?

Once you have the basics working:

1. ✅ Test volunteer registration
2. ✅ Test project applications
3. ✅ Create multiple test accounts with different roles
4. ✅ Test the approval workflow
5. 📱 Test on mobile devices
6. 🚀 Deploy to Vercel

## Need Help?

- Check the full README.md for detailed documentation
- Review Firebase Console for data
- Check browser console for error messages
- Make sure all dependencies are installed

## Folder Structure Quick Reference

```
app/
├── page.tsx              ← Landing page
├── auth/
│   ├── login/           ← Login page
│   └── register/        ← Registration page
├── dashboard/
│   ├── admin/           ← Admin dashboard
│   └── volunteer/       ← Volunteer dashboard
└── projects/            ← Browse/apply to projects

components/              ← Reusable UI components
hooks/                   ← Custom React hooks
lib/                     ← Firebase config
utils/                   ← Helper functions
```

Happy coding! 🎉
