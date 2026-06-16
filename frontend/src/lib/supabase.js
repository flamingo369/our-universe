import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROFILE_PHOTOS: 'profile-photos',
  GALLERY_PHOTOS: 'gallery-photos',
  MEMORY_PHOTOS: 'memory-photos',
  LETTER_ATTACHMENTS: 'letter-attachments',
  TIME_CAPSULE_ATTACHMENTS: 'time-capsule-attachments'
};

// Helper function to get public URL for a file
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Helper function to generate unique file path
export const generateFilePath = (bucket, fileName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = fileName.split('.').pop();
  const name = fileName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9]/g, '-');
  return `${bucket}/${timestamp}-${random}-${name}.${extension}`;
};

// Realtime channels
export const REALTIME_CHANNELS = {
  MESSAGES: 'messages',
  LOVE_NOTES: 'love_notes',
  BUCKET_LIST: 'bucket_list_items'
};

// Helper to create realtime subscription
export const subscribeToChannel = (channel, table, callback) => {
  return supabase
    .channel(channel)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe();
};

// Helper to remove realtime subscription
export const removeChannel = (channel) => {
  return supabase.removeChannel(channel);
};

export default supabase;