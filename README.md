# YSP Volunteer Management System

A modern, full-stack volunteer management platform for Youth Serve Philippines built with Next.js, Firebase, and TypeScript.

## 🚀 Features

### Core Features
- **Volunteer Management**: Manage volunteers across all YSP chapters
- **Project Tracking**: Create and track volunteer projects with real-time updates
- **Role-Based Access**: Separate dashboards for Admin, Chapter Heads, and Volunteers
- **Real-Time Updates**: Live data synchronization using Firebase Firestore
- **Volunteer Applications**: Volunteers can browse and apply to open projects
- **Admin Approval System**: Admins can approve/reject volunteer applications
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Mobile-first, works on all devices

### Technical Features
- Next.js 14 with App Router
- TypeScript for type safety
- Firebase Authentication & Firestore
- Tailwind CSS for styling
- Glassmorphism UI design
- Toast notifications
- Form validation
- Loading skeletons
- Error boundaries

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase account
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone or Download the Project

```bash
cd ysp-volunteer-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
4. Create **Firestore Database**:
   - Go to Firestore Database
   - Create database in **test mode** (for development)
   - Choose your preferred location
5. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll down to "Your apps"
   - Click "</>" (Web) to add a web app
   - Copy the configuration

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ysp-volunteer-system/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/                # Dashboard pages
│   │   ├── admin/page.tsx
│   │   └── volunteer/page.tsx
│   ├── projects/page.tsx         # Volunteer opportunities
│   ├── settings/page.tsx         # Settings page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Loading.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useFirestore.ts
│   ├── useTheme.ts
│   └── useToast.ts
├── lib/                          # Libraries and configs
│   └── firebase.ts               # Firebase initialization
├── utils/                        # Utility functions
│   ├── helpers.ts
│   └── validation.ts
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── .env.local                    # Your environment variables (create this)
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 🔥 Firebase Data Structure

### Collections

#### `volunteers`
```json
{
  "id": "auto-generated-uid",
  "name": "Juan Dela Cruz",
  "email": "juan@example.com",
  "role": "Volunteer",
  "chapter": "Tagum",
  "status": "pending",
  "appliedProjects": ["projectId1"],
  "assignedProjects": ["projectId2"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `projects`
```json
{
  "id": "auto-generated",
  "name": "Tree Planting – Cebu",
  "description": "Plant trees in coastal areas",
  "chapter": "Cebu",
  "status": "open",
  "applicants": ["volunteerId1", "volunteerId2"],
  "assignedVolunteers": ["volunteerId3"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `chapters` (optional)
```json
{
  "id": "auto-generated",
  "name": "Tagum Chapter",
  "head": "chapterHeadUserId",
  "projects": ["projectId1", "projectId2"]
}
```

## 👥 User Roles

### Volunteer (Default)
- Register and create profile
- Browse open projects
- Apply to projects
- View assigned projects
- Track project progress

### Chapter Head
- Manage chapter-specific projects
- Approve volunteer applications
- View chapter statistics

### Admin
- Full system access
- Create and manage all projects
- Approve/reject volunteers
- Assign volunteers to projects
- View system-wide analytics
- Manage all chapters

## 🎨 Available Chapters

- Tagum
- Cebu
- Manila
- Davao
- Cagayan de Oro
- Iloilo
- Bacolod
- General Santos
- Zamboanga
- Butuan

## 🚀 Deployment to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel project settings
5. Deploy!

### Vercel Environment Variables

Add all your Firebase config variables in Vercel:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 📝 Creating First Admin User

Since all new registrations create "Volunteer" accounts by default, you'll need to manually create the first admin:

1. Register a new account through the website
2. Go to Firebase Console → Firestore
3. Find your user in the `volunteers` collection
4. Edit the document and change `role` from "Volunteer" to "Admin"
5. Change `status` from "pending" to "approved"
6. Log out and log back in

## 🔐 Security Rules (Production)

Before going live, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Volunteers collection
    match /volunteers/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == userId || 
                      get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.role == 'Admin';
      allow delete: if get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.role == 'Admin';
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow create, update, delete: if get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.role in ['Admin', 'Chapter Head'];
    }
    
    // Chapters collection
    match /chapters/{chapterId} {
      allow read: if request.auth != null;
      allow create, update, delete: if get(/databases/$(database)/documents/volunteers/$(request.auth.uid)).data.role == 'Admin';
    }
  }
}
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🎯 Next Steps / Future Enhancements

- [ ] Email notifications
- [ ] File uploads for projects
- [ ] Project completion tracking
- [ ] Volunteer hours logging
- [ ] Advanced analytics and charts
- [ ] Export data to CSV/PDF
- [ ] Chat/messaging between volunteers
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Social media sharing
- [ ] Volunteer certificates

## 📄 License

This project is created for Youth Serve Philippines.

## 💬 Support

For issues or questions:
- Create an issue in the repository
- Contact YSP admin team
- Email: info@youthservephilippines.org

## 🙏 Acknowledgments

Built with ❤️ for Youth Serve Philippines volunteers across the nation.

---

**Note**: Make sure to update Firebase security rules before deploying to production and never commit your `.env.local` file to version control.
