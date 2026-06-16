# Our Universe - Supabase Migration Plan

## Overview

This document outlines the complete migration from MongoDB Atlas + Cloudinary + JWT Auth to Supabase (PostgreSQL, Authentication, Storage, and Realtime).

## Current Stack
- **Database**: MongoDB Atlas with Mongoose ODM
- **File Storage**: Cloudinary
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Realtime**: Socket.IO

## New Stack
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Realtime**: Supabase Realtime

---

## 1. Supabase Project Setup

### Step 1.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Enter project details:
   - Name: `our-universe`
   - Database Password: (save this securely)
   - Region: Choose closest to your location
4. Wait for project to be created (~2 minutes)

### Step 1.2: Get Project Credentials
1. Go to Project Settings → API
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbG...`
   - **Service Role Key**: (keep secret, for backend only)

---

## 2. Environment Variables Setup

### Backend (.env)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

---

## 3. Database Schema (SQL)

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    email TEXT,
    profile_photo_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    
    -- Relationship details
    relationship_start_date DATE,
    
    -- Location for distance calculation
    location_country TEXT DEFAULT '',
    location_city TEXT DEFAULT '',
    location_lat NUMERIC DEFAULT 0,
    location_lng NUMERIC DEFAULT 0,
    
    -- Partner reference (for two-user system)
    partner_id UUID REFERENCES profiles(id),
    
    -- Preferences
    favorite_color TEXT DEFAULT '#ec4899',
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (for chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'emoji', 'system')),
    image_url TEXT,
    room TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message reactions
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Photos table (for gallery)
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT '',
    description TEXT DEFAULT '',
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    storage_path TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    category TEXT DEFAULT 'memories' CHECK (category IN ('memories', 'moments', 'special', 'random', 'selfie', 'nature', 'travel')),
    tags TEXT[] DEFAULT '{}',
    date_taken DATE,
    location TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo likes
CREATE TABLE photo_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(photo_id, user_id)
);

-- Photo comments
CREATE TABLE photo_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Letters table
CREATE TABLE letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    theme TEXT DEFAULT 'romantic' CHECK (theme IN ('romantic', 'casual', 'poetic', 'birthday', 'anniversary', 'miss-you', 'love', 'custom')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'read')),
    is_favorite BOOLEAN DEFAULT false,
    favorite_by_recipient BOOLEAN DEFAULT false,
    envelope_style TEXT DEFAULT 'classic' CHECK (envelope_style IN ('classic', 'modern', 'vintage', 'cute', 'elegant')),
    mood TEXT DEFAULT '❤️',
    read_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Letter attachments
CREATE TABLE letter_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_id UUID REFERENCES letters(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    type TEXT CHECK (type IN ('image')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline events
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    event_date DATE NOT NULL,
    category TEXT DEFAULT 'special_moment' CHECK (category IN (
        'first_message', 'first_call', 'first_video_call', 'first_meeting',
        'anniversary', 'birthday', 'special_moment', 'milestone',
        'trip', 'gift', 'confession', 'proposal', 'other'
    )),
    location TEXT,
    lat NUMERIC,
    lng NUMERIC,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurring_type TEXT CHECK (recurring_type IN ('yearly', 'monthly', 'weekly')),
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    mood TEXT DEFAULT '❤️',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline event photos
CREATE TABLE timeline_event_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES timeline_events(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories table
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    memory_date DATE NOT NULL,
    location TEXT,
    lat NUMERIC,
    lng NUMERIC,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT DEFAULT 'special' CHECK (category IN (
        'first', 'trip', 'celebration', 'everyday', 'surprise',
        'gift', 'call', 'message', 'video_call', 'special', 'other'
    )),
    mood TEXT DEFAULT '❤️',
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory photos
CREATE TABLE memory_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bucket list items
CREATE TABLE bucket_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'experience' CHECK (category IN (
        'travel', 'experience', 'milestone', 'gift', 'surprise',
        'adventure', 'romantic', 'fun', 'learning', 'other'
    )),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    target_date DATE,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    completed_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    location_country TEXT,
    location_city TEXT,
    lat NUMERIC,
    lng NUMERIC,
    estimated_cost NUMERIC DEFAULT 0,
    notes TEXT DEFAULT '',
    mood TEXT DEFAULT '⭐',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bucket list item photos
CREATE TABLE bucket_list_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES bucket_list_items(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Love notes (sticky notes)
CREATE TABLE love_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    color TEXT DEFAULT 'yellow' CHECK (color IN (
        'yellow', 'pink', 'blue', 'green', 'purple', 'orange', 'red', 'white'
    )),
    position_x NUMERIC DEFAULT 0,
    position_y NUMERIC DEFAULT 0,
    rotation NUMERIC DEFAULT 0,
    size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
    mood TEXT DEFAULT '❤️',
    category TEXT DEFAULT 'love' CHECK (category IN (
        'love', 'good_morning', 'good_night', 'miss_you', 'thinking_of_you',
        'encouragement', 'thank_you', 'sorry', 'celebration', 'random', 'quote'
    )),
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time capsules
CREATE TABLE time_capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'letter' CHECK (type IN ('letter', 'message', 'photo', 'video', 'audio', 'mixed')),
    unlock_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'opened', 'expired')),
    opened_at TIMESTAMPTZ,
    occasion TEXT DEFAULT 'special_day' CHECK (occasion IN (
        'anniversary', 'birthday', 'special_day', 'just_because',
        'future_self', 'memory', 'surprise', 'milestone', 'other'
    )),
    mood TEXT DEFAULT '💌',
    reminder_sent BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time capsule attachments
CREATE TABLE time_capsule_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capsule_id UUID REFERENCES time_capsules(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    type TEXT CHECK (type IN ('image', 'video', 'audio')),
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_room ON messages(room, created_at DESC);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by, created_at DESC);
CREATE INDEX idx_photos_category_featured ON photos(category, is_featured);
CREATE INDEX idx_timeline_event_date ON timeline_events(event_date DESC);
CREATE INDEX idx_memories_memory_date ON memories(memory_date DESC);
CREATE INDEX idx_bucket_list_status ON bucket_list_items(status, priority DESC);
CREATE INDEX idx_love_notes_active ON love_notes(is_active, created_at DESC);
CREATE INDEX idx_time_capsules_unlock ON time_capsules(unlock_date);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_letters_updated_at BEFORE UPDATE ON letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON timeline_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bucket_list_items_updated_at BEFORE UPDATE ON bucket_list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_love_notes_updated_at BEFORE UPDATE ON love_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_capsules_updated_at BEFORE UPDATE ON time_capsules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Messages policies (only sender and receiver can access)
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert own messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Photos policies
CREATE POLICY "Users can view all photos" ON photos
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own photos" ON photos
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own photos" ON photos
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own photos" ON photos
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Letters policies
CREATE POLICY "Users can view sent/received letters" ON letters
    FOR SELECT USING (auth.uid() = author_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert own letters" ON letters
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own letters" ON letters
    FOR UPDATE USING (auth.uid() = author_id);

-- Timeline policies
CREATE POLICY "Users can view all timeline events" ON timeline_events
    FOR SELECT USING (true);

CREATE POLICY "Users can manage timeline events" ON timeline_events
    FOR ALL USING (true);

-- Memories policies
CREATE POLICY "Users can view all memories" ON memories
    FOR SELECT USING (true);

CREATE POLICY "Users can manage memories" ON memories
    FOR ALL USING (true);

-- Bucket list policies
CREATE POLICY "Users can view all bucket list items" ON bucket_list_items
    FOR SELECT USING (true);

CREATE POLICY "Users can manage bucket list items" ON bucket_list_items
    FOR ALL USING (true);

-- Love notes policies
CREATE POLICY "Users can view all love notes" ON love_notes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage love notes" ON love_notes
    FOR ALL USING (true);

-- Time capsules policies
CREATE POLICY "Users can view own time capsules" ON time_capsules
    FOR SELECT USING (auth.uid() = author_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert own time capsules" ON time_capsules
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own time capsules" ON time_capsules
    FOR UPDATE USING (auth.uid() = author_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, username)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'username'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. Supabase Storage Setup

Create the following buckets in Supabase Storage:

### Bucket 1: `profile-photos`
- Public: Yes
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp

### Bucket 2: `gallery-photos`
- Public: Yes
- File size limit: 10MB
- Allowed MIME types: image/jpeg, image/png, image/webp

### Bucket 3: `memory-photos`
- Public: Yes
- File size limit: 10MB
- Allowed MIME types: image/jpeg, image/png, image/webp

### Bucket 4: `letter-attachments`
- Public: No (private)
- File size limit: 10MB
- Allowed MIME types: image/jpeg, image/png, image/webp

### Bucket 5: `time-capsule-attachments`
- Public: No (private)
- File size limit: 50MB
- Allowed MIME types: image/*, video/*, audio/*

---

## 5. Supabase Realtime Setup

Enable Realtime for the following tables in Supabase Dashboard:
1. `messages` - for real-time chat
2. `love_notes` - for real-time love notes board
3. `bucket_list_items` - for real-time bucket list updates

---

## 6. Installation Steps

### Backend Dependencies
```bash
cd backend
npm uninstall mongoose cloudinary jsonwebtoken bcryptjs
npm install @supabase/supabase-js
```

### Frontend Dependencies
```bash
cd frontend
npm install @supabase/supabase-js
```

---

## 7. File Structure After Migration

```
our-universe/
├── backend/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   ├── supabase.js       # NEW: Supabase client config
│       │   └── socket.js         # REMOVED: Using Supabase Realtime
│       ├── middleware/
│       │   ├── authMiddleware.js # UPDATED: Supabase auth
│       │   ├── uploadMiddleware.js # UPDATED: Supabase Storage
│       │   └── errorMiddleware.js
│       ├── services/             # NEW: Business logic layer
│       │   ├── authService.js
│       │   ├── storageService.js
│       │   └── realtimeService.js
│       ├── controllers/          # UPDATED: Using Supabase
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── chatController.js
│       │   ├── galleryController.js
│       │   ├── letterController.js
│       │   ├── timelineController.js
│       │   ├── memoryController.js
│       │   ├── bucketController.js
│       │   └── capsuleController.js
│       └── routes/
│           ├── authRoutes.js
│           ├── userRoutes.js
│           ├── chatRoutes.js
│           ├── galleryRoutes.js
│           ├── letterRoutes.js
│           ├── timelineRoutes.js
│           ├── memoryRoutes.js
│           ├── bucketRoutes.js
│           └── capsuleRoutes.js
│
└── frontend/
    ├── .env
    ├── package.json
    └── src/
        ├── App.jsx             # UPDATED: Supabase provider
        ├── main.jsx
        ├── lib/
        │   └── supabase.js     # NEW: Supabase client
        ├── context/
        │   ├── AuthContext.jsx # UPDATED: Supabase Auth
        │   └── SocketContext.jsx # REMOVED: Using Supabase Realtime
        ├── hooks/              # NEW: Custom hooks
        │   ├── useRealtime.js
        │   └── useStorage.js
        ├── api/
        │   └── axios.js
        ├── routes/
        │   └── ProtectedRoute.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx    # UPDATED: Supabase Auth
        │   ├── SignupPage.jsx   # UPDATED: Supabase Auth
        │   └── ...
        └── layouts/
            └── MainLayout.jsx
```

---

## 8. Migration Checklist

- [ ] Create Supabase project
- [ ] Run database schema SQL
- [ ] Create storage buckets
- [ ] Enable Realtime for tables
- [ ] Update backend .env
- [ ] Update frontend .env
- [ ] Install new dependencies
- [ ] Create Supabase config files
- [ ] Update authentication system
- [ ] Update file upload system
- [ ] Update database queries
- [ ] Update realtime functionality
- [ ] Test all features
- [ ] Deploy to production

---

## 9. Key Changes Summary

| Feature | Before | After |
|---------|--------|-------|
| Database | MongoDB + Mongoose | Supabase PostgreSQL |
| Auth | JWT (custom) | Supabase Auth |
| File Storage | Cloudinary | Supabase Storage |
| Realtime | Socket.IO | Supabase Realtime |
| User Model | Mongoose Schema | PostgreSQL Table + RLS |
| Queries | Mongoose methods | Supabase client |

---

## 10. Benefits of Migration

1. **Simplified Architecture**: Single platform for DB, Auth, Storage, and Realtime
2. **Better Security**: Row Level Security (RLS) built-in
3. **Cost Effective**: Free tier includes generous limits
4. **Faster Development**: Less boilerplate code
5. **Real-time Built-in**: No need for separate Socket.IO server
6. **Automatic APIs**: Supabase generates REST and GraphQL APIs
7. **Better Scalability**: PostgreSQL is highly scalable

---

## 11. Important Notes

1. **Two-User System**: This app is designed for only 2 users (Ajesh & Shofi), so we can simplify some security policies
2. **Migration Deadline**: Target completion before July 17
3. **Data Migration**: Existing MongoDB data will need to be migrated to PostgreSQL
4. **Testing**: Thoroughly test all features after migration