const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY');
  process.exit(1);
}

// Service role client (for backend operations with full access)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Anon client (for operations that respect RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get Supabase client with user's token
const getSupabaseClient = (accessToken) => {
  if (!accessToken) {
    return supabase;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

// Storage bucket names
const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  GALLERY_PHOTOS: 'gallery-photos',
  MEMORY_PHOTOS: 'memory-photos',
  LETTER_ATTACHMENTS: 'letter-attachments',
  TIME_CAPSULE_ATTACHMENTS: 'time-capsule-attachments'
};

// Helper function to get public URL for a file
const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Helper function to generate unique file path
const generateFilePath = (bucket, fileName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop();
  const name = fileName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9]/g, '-');
  return `${bucket}/${timestamp}-${random}-${name}.${extension}`;
};

module.exports = {
  supabase,
  supabaseAdmin,
  getSupabaseClient,
  STORAGE_BUCKETS,
  getPublicUrl,
  generateFilePath
};