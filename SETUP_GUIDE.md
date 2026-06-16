# Our Universe - Supabase Setup Guide

Complete step-by-step guide to migrate from MongoDB + Cloudinary + JWT to Supabase.

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier is sufficient)
- Existing "Our Universe" project

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `our-universe`
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Choose the closest to your location
4. Click **"Create new project"** and wait (~2 minutes)

---

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **API Keys** → **anon/public**: `eyJhbG...`
   - **API Keys** → **service_role** (secret!): `eyJhbG...`

---

## Step 3: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **"Run"** or press `Ctrl+Enter`
5. Wait for all tables to be created (you should see a success message)

### Verify Database Setup

Run this query to check tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- profiles
- messages
- message_reactions
- photos
- photo_likes
- photo_comments
- letters
- letter_attachments
- timeline_events
- timeline_event_photos
- memories
- memory_photos
- bucket_list_items
- bucket_list_photos
- love_notes
- time_capsules
- time_capsule_attachments

---

## Step 4: Create Storage Buckets

1. In Supabase dashboard, go to **Storage**
2. Click **"New bucket"** for each of these:

| Bucket Name | Public | File Size Limit |
|-------------|--------|-----------------|
| `profile-photos` | ✅ Yes | 5 MB |
| `gallery-photos` | ✅ Yes | 10 MB |
| `memory-photos` | ✅ Yes | 10 MB |
| `letter-attachments` | ❌ No | 10 MB |
| `time-capsule-attachments` | ❌ No | 50 MB |

### Alternative: Create Buckets via SQL

Run this in SQL Editor:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES 
  ('profile-photos', 'profile-photos', true, 5242880),
  ('gallery-photos', 'gallery-photos', true, 10485760),
  ('memory-photos', 'memory-photos', true, 10485760),
  ('letter-attachments', 'letter-attachments', false, 10485760),
  ('time-capsule-attachments', 'time-capsule-attachments', false, 52428800);
```

---

## Step 5: Enable Realtime

1. In Supabase dashboard, go to **Database** → **Replication**
2. Find and toggle **ON** for these tables:
   - `messages`
   - `love_notes`
   - `bucket_list_items`

---

## Step 6: Update Environment Variables

### Backend (.env)

Copy `backend/.env.example` to `backend/.env` and update:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Settings
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-random-secret-key-here
```

### Frontend (.env)

Copy `frontend/.env.example` to `frontend/.env` and update:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

---

## Step 7: Install Dependencies

### Backend

```bash
cd backend

# Remove old dependencies
npm uninstall mongoose cloudinary jsonwebtoken bcryptjs

# Install Supabase
npm install @supabase/supabase-js

# Install other needed packages
npm install express cors dotenv cookie-parser
```

### Frontend

```bash
cd frontend

# Install Supabase
npm install @supabase/supabase-js
```

---

## Step 8: Update Backend Code

### Files to Create/Update

1. **Create** `backend/src/config/supabase.js` (already provided)
2. **Update** `backend/src/middleware/authMiddleware.js` for Supabase auth
3. **Update** controllers to use Supabase instead of Mongoose

### Updated authMiddleware.js

```javascript
const { supabaseAdmin } = require('../config/supabase');

const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }

    // Attach user to request
    req.user = profile;
    req.userId = user.id;
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in auth middleware' 
    });
  }
};

module.exports = { protect };
```

---

## Step 9: Create Users

Since this is a two-user app (Ajesh & Shofi), you need to create the initial users:

### Option 1: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Create first user:
   - Email: `ajesh@ouruniverse.com`
   - Password: (choose a password)
   - User Metadata: `{"name": "Ajesh", "username": "ajesh"}`
4. Create second user:
   - Email: `shofi@ouruniverse.com`
   - Password: (choose a password)
   - User Metadata: `{"name": "Shofi", "username": "shofi"}`

### Option 2: Via Signup Page

Simply use your app's signup page to create both accounts.

### Link Users as Partners

After creating users, run this SQL to link them:

```sql
-- Get the user IDs first
SELECT id, email, name FROM profiles;

-- Update partner relationships (replace UUIDs with actual IDs)
UPDATE profiles 
SET partner_id = (SELECT id FROM profiles WHERE email = 'shofi@ouruniverse.com'),
    relationship_start_date = '2023-01-01'  -- Your special date
WHERE email = 'ajesh@ouruniverse.com';

UPDATE profiles 
SET partner_id = (SELECT id FROM profiles WHERE email = 'ajesh@ouruniverse.com'),
    relationship_start_date = '2023-01-01'
WHERE email = 'shofi@ouruniverse.com';
```

---

## Step 10: Update Frontend Code

### Files Already Provided

The following files have been created for you:

1. `frontend/src/lib/supabase.js` - Supabase client
2. `frontend/src/context/AuthContext.jsx` - Updated auth context
3. `frontend/src/hooks/useRealtime.js` - Realtime hooks
4. `frontend/src/hooks/useStorage.js` - Storage hooks

### Update App.jsx

Make sure your App.jsx wraps everything with AuthProvider:

```jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
// ... other imports

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          {/* Your routes */}
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}
```

---

## Step 11: Test the Setup

### Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ Supabase connected successfully
🚀 Server running on port 5000
🌍 Environment: development
💕 Our Universe - Private Space for Ajesh & Shofi
```

### Start Frontend

```bash
cd frontend
npm run dev
```

### Test Flow

1. Open `http://localhost:5173`
2. Try to sign up a new user
3. Verify user appears in Supabase Auth users
4. Check profile was created in profiles table
5. Try logging in
6. Test uploading a photo to gallery
7. Test sending a chat message

---

## Step 12: Update API Calls

### Example: Gallery API

```javascript
// frontend/src/api/gallery.js
import supabase from '../lib/supabase';

export const galleryApi = {
  // Get all photos
  getPhotos: async (filters = {}) => {
    let query = supabase.from('photos').select(`
      *,
      uploader:uploaded_by (id, name, profile_photo_url)
    `).eq('is_active', true);

    if (filters.category) query = query.eq('category', filters.category);
    
    return query.order('created_at', { ascending: false });
  },

  // Upload photo
  uploadPhoto: async (file, photoData) => {
    // Upload file to storage
    const filePath = `gallery/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('gallery-photos')
      .getPublicUrl(filePath);

    // Create database record
    const { data, error } = await supabase.from('photos').insert({
      ...photoData,
      url: publicUrl,
      storage_path: filePath
    }).select().single();

    return data;
  }
};
```

---

## Troubleshooting

### Issue: "Invalid API key"

**Solution**: Make sure you're using the correct keys:
- Frontend: Use `anon` key
- Backend: Use `service_role` key

### Issue: "Row Level Security policy violation"

**Solution**: Check your RLS policies. For development, you can temporarily disable RLS:
```sql
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

### Issue: Realtime not working

**Solution**: 
1. Make sure Realtime is enabled for the table in Database → Replication
2. Check your realtime subscription in the browser console

### Issue: File upload fails

**Solution**:
1. Check bucket exists and is public (for public files)
2. Check file size doesn't exceed bucket limit
3. Check storage policies are correct

---

## Production Deployment

### Environment Variables for Production

Set these in your hosting platform (Vercel, Railway, etc.):

**Backend**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-domain.com`

**Frontend**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL=https://your-api-domain.com`

### Security Considerations

1. **Never expose service_role key in frontend code**
2. **Use RLS policies to protect data**
3. **Enable 2FA for Supabase account**
4. **Set up proper CORS in Supabase**

---

## Migration Complete! 🎉

Your app is now running on Supabase with:
- ✅ PostgreSQL database
- ✅ Supabase Authentication
- ✅ Supabase Storage for files
- ✅ Supabase Realtime for live updates

### Next Steps

1. Test all features thoroughly
2. Migrate existing data from MongoDB (if needed)
3. Set up monitoring and logging
4. Deploy to production

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

---

💕 **Our Universe - Private Space for Ajesh & Shofi**