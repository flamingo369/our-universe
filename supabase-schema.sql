-- Our Universe - Supabase Database Schema
-- Run this SQL in your Supabase project's SQL Editor
-- This creates all tables, indexes, triggers, and security policies

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
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

-- ============================================
-- MESSAGES TABLE (for chat)
-- ============================================
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

-- ============================================
-- MESSAGE REACTIONS TABLE
-- ============================================
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- ============================================
-- PHOTOS TABLE (for gallery)
-- ============================================
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

-- ============================================
-- PHOTO LIKES TABLE
-- ============================================
CREATE TABLE photo_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(photo_id, user_id)
);

-- ============================================
-- PHOTO COMMENTS TABLE
-- ============================================
CREATE TABLE photo_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LETTERS TABLE
-- ============================================
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

-- ============================================
-- LETTER ATTACHMENTS TABLE
-- ============================================
CREATE TABLE letter_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_id UUID REFERENCES letters(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    type TEXT CHECK (type IN ('image')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TIMELINE EVENTS TABLE
-- ============================================
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

-- ============================================
-- TIMELINE EVENT PHOTOS TABLE
-- ============================================
CREATE TABLE timeline_event_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES timeline_events(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEMORIES TABLE
-- ============================================
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

-- ============================================
-- MEMORY PHOTOS TABLE
-- ============================================
CREATE TABLE memory_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BUCKET LIST ITEMS TABLE
-- ============================================
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

-- ============================================
-- BUCKET LIST PHOTOS TABLE
-- ============================================
CREATE TABLE bucket_list_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES bucket_list_items(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOVE NOTES TABLE (sticky notes)
-- ============================================
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

-- ============================================
-- TIME CAPSULES TABLE
-- ============================================
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

-- ============================================
-- TIME CAPSULE ATTACHMENTS TABLE
-- ============================================
CREATE TABLE time_capsule_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capsule_id UUID REFERENCES time_capsules(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    type TEXT CHECK (type IN ('image', 'video', 'audio')),
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_messages_room ON messages(room, created_at DESC);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by, created_at DESC);
CREATE INDEX idx_photos_category_featured ON photos(category, is_featured);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX idx_timeline_event_date ON timeline_events(event_date DESC);
CREATE INDEX idx_timeline_created_at ON timeline_events(created_at DESC);
CREATE INDEX idx_memories_memory_date ON memories(memory_date DESC);
CREATE INDEX idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX idx_bucket_list_status ON bucket_list_items(status, priority DESC);
CREATE INDEX idx_bucket_list_created_at ON bucket_list_items(created_at DESC);
CREATE INDEX idx_love_notes_active ON love_notes(is_active, created_at DESC);
CREATE INDEX idx_love_notes_pinned ON love_notes(is_pinned DESC, created_at DESC);
CREATE INDEX idx_time_capsules_unlock ON time_capsules(unlock_date);
CREATE INDEX idx_time_capsules_status ON time_capsules(status, unlock_date);
CREATE INDEX idx_letters_author_recipient ON letters(author_id, recipient_id, created_at DESC);
CREATE INDEX idx_letters_status ON letters(status, created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
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

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsule_attachments ENABLE ROW LEVEL SECURITY;

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

-- Message reactions policies
CREATE POLICY "Users can view message reactions" ON message_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can create reactions" ON message_reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" ON message_reactions
    FOR DELETE USING (auth.uid() = user_id);

-- Photos policies
CREATE POLICY "Users can view all photos" ON photos
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own photos" ON photos
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own photos" ON photos
    FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own photos" ON photos
    FOR DELETE USING (auth.uid() = uploaded_by);

-- Photo likes policies
CREATE POLICY "Users can view photo likes" ON photo_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can create likes" ON photo_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON photo_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Photo comments policies
CREATE POLICY "Users can view photo comments" ON photo_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON photo_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON photo_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Letters policies
CREATE POLICY "Users can view sent/received letters" ON letters
    FOR SELECT USING (auth.uid() = author_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert own letters" ON letters
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own letters" ON letters
    FOR UPDATE USING (auth.uid() = author_id);

-- Letter attachments policies
CREATE POLICY "Users can view letter attachments" ON letter_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM letters 
            WHERE letters.id = letter_attachments.letter_id 
            AND (letters.author_id = auth.uid() OR letters.recipient_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert letter attachments" ON letter_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM letters 
            WHERE letters.id = letter_attachments.letter_id 
            AND letters.author_id = auth.uid()
        )
    );

-- Timeline policies
CREATE POLICY "Users can view all timeline events" ON timeline_events
    FOR SELECT USING (true);

CREATE POLICY "Users can manage timeline events" ON timeline_events
    FOR ALL USING (true);

-- Timeline event photos policies
CREATE POLICY "Users can view timeline event photos" ON timeline_event_photos
    FOR SELECT USING (true);

CREATE POLICY "Users can manage timeline event photos" ON timeline_event_photos
    FOR ALL USING (true);

-- Memories policies
CREATE POLICY "Users can view all memories" ON memories
    FOR SELECT USING (true);

CREATE POLICY "Users can manage memories" ON memories
    FOR ALL USING (true);

-- Memory photos policies
CREATE POLICY "Users can view memory photos" ON memory_photos
    FOR SELECT USING (true);

CREATE POLICY "Users can manage memory photos" ON memory_photos
    FOR ALL USING (true);

-- Bucket list policies
CREATE POLICY "Users can view all bucket list items" ON bucket_list_items
    FOR SELECT USING (true);

CREATE POLICY "Users can manage bucket list items" ON bucket_list_items
    FOR ALL USING (true);

-- Bucket list photos policies
CREATE POLICY "Users can view bucket list photos" ON bucket_list_photos
    FOR SELECT USING (true);

CREATE POLICY "Users can manage bucket list photos" ON bucket_list_photos
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

-- Time capsule attachments policies
CREATE POLICY "Users can view time capsule attachments" ON time_capsule_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM time_capsules 
            WHERE time_capsules.id = time_capsule_attachments.capsule_id 
            AND (time_capsules.author_id = auth.uid() OR time_capsules.recipient_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert time capsule attachments" ON time_capsule_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM time_capsules 
            WHERE time_capsules.id = time_capsule_attachments.capsule_id 
            AND time_capsules.author_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last_seen on profiles
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles SET last_seen = NOW() WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENABLE REALTIME FOR TABLES
-- ============================================
-- Note: Run these in Supabase Dashboard > Database > Replication
-- Or use the Supabase API to enable realtime

-- The following tables should have realtime enabled:
-- - messages
-- - love_notes
-- - bucket_list_items

-- ============================================
-- INITIAL DATA (Optional - for testing)
-- ============================================
-- Uncomment and run this section to add test data
-- You'll need to create users first via Supabase Auth

-- INSERT INTO profiles (id, name, username, email, relationship_start_date) 
-- VALUES ('user-uuid-1', 'Ajesh', 'ajesh', 'ajesh@example.com', '2023-01-01'),
--        ('user-uuid-2', 'Shofi', 'shofi', 'shofi@example.com', '2023-01-01');

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
-- Run this in Supabase Dashboard > Storage or via API

-- Create buckets (run in Supabase Dashboard SQL or via API):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-photos', 'gallery-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('memory-photos', 'memory-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('letter-attachments', 'letter-attachments', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('time-capsule-attachments', 'time-capsule-attachments', false);

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Profile photos - anyone can view, only owner can upload
CREATE POLICY "Profile photos are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload profile photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own profile photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own profile photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Gallery photos - anyone can view and upload
CREATE POLICY "Gallery photos are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'gallery-photos');

CREATE POLICY "Users can upload gallery photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'gallery-photos');

CREATE POLICY "Users can delete gallery photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'gallery-photos');

-- Memory photos - anyone can view and upload
CREATE POLICY "Memory photos are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'memory-photos');

CREATE POLICY "Users can upload memory photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'memory-photos');

CREATE POLICY "Users can delete memory photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'memory-photos');

-- Letter attachments - only authenticated users can access
CREATE POLICY "Letter attachments are private" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'letter-attachments' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can upload letter attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'letter-attachments' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete letter attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'letter-attachments' AND 
        auth.role() = 'authenticated'
    );

-- Time capsule attachments - only authenticated users can access
CREATE POLICY "Time capsule attachments are private" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'time-capsule-attachments' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can upload time capsule attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'time-capsule-attachments' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete time capsule attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'time-capsule-attachments' AND 
        auth.role() = 'authenticated'
    );

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
-- After running this script:
-- 1. Enable Realtime for messages, love_notes, and bucket_list_items tables
-- 2. Create the storage buckets in the Storage section
-- 3. Update your .env files with Supabase credentials
-- 4. Create your first two users via Supabase Auth
-- 5. Link the users as partners in the profiles table

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Enable Realtime for: messages, love_notes, bucket_list_items';
    RAISE NOTICE '   2. Create storage buckets in Storage section';
    RAISE NOTICE '   3. Update .env files with Supabase credentials';
    RAISE NOTICE '   4. Create users via Supabase Auth';
    RAISE NOTICE '   5. Link users as partners in profiles table';
    RAISE NOTICE '💕 Our Universe - Private Space for Ajesh & Shofi';
END $$;