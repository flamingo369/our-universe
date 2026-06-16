import { useState } from 'react';
import supabase, { STORAGE_BUCKETS, getPublicUrl, generateFilePath } from '../lib/supabase';

// Custom hook for file upload
export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  // Upload file to Supabase Storage
  const uploadFile = async (file, bucket, options = {}) => {
    const { path = null, public = true } = options;

    if (!file) {
      setError('No file provided');
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Generate file path if not provided
      const filePath = path || generateFilePath(bucket, file.name);

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          duplex: options.duplex || undefined,
          // Progress callback
          ...(options.onProgress && {
            onProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              setProgress(progress);
              if (options.onProgress) options.onProgress(progress);
            }
          })
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const publicUrl = getPublicUrl(bucket, filePath);

      setUploading(false);
      setProgress(100);

      return {
        path: filePath,
        url: publicUrl,
        bucket
      };
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setUploading(false);
      setProgress(0);
      return null;
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file, userId) => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    const path = `public/${userId}/${Date.now()}-${file.name}`;
    return await uploadFile(file, STORAGE_BUCKETS.PROFILE_PHOTOS, { path });
  };

  // Upload gallery photo
  const uploadGalleryPhoto = async (file) => {
    return await uploadFile(file, STORAGE_BUCKETS.GALLERY_PHOTOS);
  };

  // Upload memory photo
  const uploadMemoryPhoto = async (file) => {
    return await uploadFile(file, STORAGE_BUCKETS.MEMORY_PHOTOS);
  };

  // Upload letter attachment
  const uploadLetterAttachment = async (file) => {
    return await uploadFile(file, STORAGE_BUCKETS.LETTER_ATTACHMENTS, { public: false });
  };

  // Upload time capsule attachment
  const uploadTimeCapsuleAttachment = async (file) => {
    return await uploadFile(file, STORAGE_BUCKETS.TIME_CAPSULE_ATTACHMENTS, { public: false });
  };

  // Delete file
  const deleteFile = async (bucket, path) => {
    setUploading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (deleteError) throw deleteError;

      setUploading(false);
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
      setUploading(false);
      return false;
    }
  };

  // Download file (get signed URL for private files)
  const getSignedUrl = async (bucket, path, expiresIn = 60) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) throw error;

      return data.signedUrl;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      return null;
    }
  };

  // Upload multiple files
  const uploadMultipleFiles = async (files, bucket, options = {}) => {
    const results = [];

    for (const file of files) {
      const result = await uploadFile(file, bucket, options);
      if (result) {
        results.push(result);
      }
    }

    return results;
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    uploading,
    progress,
    error,
    uploadFile,
    uploadProfilePhoto,
    uploadGalleryPhoto,
    uploadMemoryPhoto,
    uploadLetterAttachment,
    uploadTimeCapsuleAttachment,
    deleteFile,
    getSignedUrl,
    uploadMultipleFiles,
    reset,
    STORAGE_BUCKETS
  };
};

// Custom hook for gallery operations
export const useGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { uploadGalleryPhoto, deleteFile, uploading, progress } = useStorage();

  // Fetch all gallery photos
  const fetchPhotos = async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('photos')
        .select(`
          *,
          uploader:uploaded_by (id, name, profile_photo_url)
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Order by created date
      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new photo
  const addPhoto = async (file, photoData = {}) => {
    const { user } = useAuth();
    if (!user) {
      setError('Must be logged in to upload photos');
      return null;
    }

    // Upload file first
    const uploadResult = await uploadGalleryPhoto(file);
    if (!uploadResult) {
      return null;
    }

    // Create database record
    const newPhoto = {
      uploaded_by: user.id,
      url: uploadResult.url,
      storage_path: uploadResult.path,
      title: photoData.title || '',
      description: photoData.description || '',
      category: photoData.category || 'memories',
      tags: photoData.tags || [],
      date_taken: photoData.dateTaken || null,
      location: photoData.location || '',
      is_featured: photoData.isFeatured || false,
      ...photoData
    };

    try {
      const { data, error: insertError } = await supabase
        .from('photos')
        .insert(newPhoto)
        .select(`
          *,
          uploader:uploaded_by (id, name, profile_photo_url)
        `)
        .single();

      if (insertError) throw insertError;

      setPhotos(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding photo:', err);
      // Delete uploaded file if database insert failed
      await deleteFile(STORAGE_BUCKETS.GALLERY_PHOTOS, uploadResult.path);
      setError(err.message);
      return null;
    }
  };

  // Update photo
  const updatePhoto = async (photoId, updates) => {
    try {
      const { data, error: updateError } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', photoId)
        .select()
        .single();

      if (updateError) throw updateError;

      setPhotos(prev => prev.map(p => p.id === photoId ? data : p));
      return data;
    } catch (err) {
      console.error('Error updating photo:', err);
      setError(err.message);
      return null;
    }
  };

  // Delete photo
  const deletePhoto = async (photoId) => {
    // Find the photo first to get the storage path
    const photo = photos.find(p => p.id === photoId);
    if (!photo) {
      setError('Photo not found');
      return false;
    }

    try {
      // Soft delete - update is_active to false
      const { error: deleteError } = await supabase
        .from('photos')
        .update({ is_active: false })
        .eq('id', photoId);

      if (deleteError) throw deleteError;

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      return true;
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(err.message);
      return false;
    }
  };

  // Toggle like on photo
  const toggleLike = async (photoId) => {
    const { user } = useAuth();
    if (!user) {
      setError('Must be logged in to like photos');
      return false;
    }

    const photo = photos.find(p => p.id === photoId);
    if (!photo) {
      setError('Photo not found');
      return false;
    }

    const isLiked = photo.likes?.some(like => like.user_id === user.id);

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('photo_likes')
          .delete()
          .match({ photo_id: photoId, user_id: user.id });

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('photo_likes')
          .insert({ photo_id: photoId, user_id: user.id });

        if (error) throw error;
      }

      // Refresh photos to get updated like status
      await fetchPhotos();
      return true;
    } catch (err) {
      console.error('Error toggling like:', err);
      setError(err.message);
      return false;
    }
  };

  // Add comment to photo
  const addComment = async (photoId, text) => {
    const { user } = useAuth();
    if (!user) {
      setError('Must be logged in to comment');
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('photo_comments')
        .insert({
          photo_id: photoId,
          user_id: user.id,
          text
        })
        .select(`
          *,
          commenter:user_id (id, name, profile_photo_url)
        `)
        .single();

      if (insertError) throw insertError;
      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.message);
      return null;
    }
  };

  const reset = () => {
    setPhotos([]);
    setLoading(false);
    setError(null);
  };

  return {
    photos,
    loading,
    error,
    uploading,
    progress,
    fetchPhotos,
    addPhoto,
    updatePhoto,
    deletePhoto,
    toggleLike,
    addComment,
    reset
  };
};

export default {
  useStorage,
  useGallery
};