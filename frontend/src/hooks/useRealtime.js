import { useState, useEffect, useCallback } from 'react';
import supabase, { subscribeToChannel, removeChannel, getPublicUrl, STORAGE_BUCKETS } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Custom hook for real-time messages
export const useRealtimeMessages = (room) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!room || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (id, name, profile_photo_url),
          receiver:receiver_id (id, name, profile_photo_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('room', room)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [room, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Set up realtime subscription
  useEffect(() => {
    if (!room || !user) return;

    const channel = subscribeToChannel(
      `messages:${room}`,
      'messages',
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        if (eventType === 'INSERT') {
          // Only add if it's for this room
          if (newRecord.room === room && !newRecord.is_deleted) {
            setMessages(prev => [...prev, {
              ...newRecord,
              sender: newRecord.sender_id === user.id ? user : null
            }]);
          }
        } else if (eventType === 'UPDATE') {
          setMessages(prev => prev.map(msg => 
            msg.id === newRecord.id ? { ...msg, ...newRecord } : msg
          ));
        } else if (eventType === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== oldRecord.id));
        }
      }
    );

    return () => {
      removeChannel(channel);
    };
  }, [room, user]);

  const sendMessage = async (content, type = 'text', imageUrl = null) => {
    if (!user || !room) return null;

    // Get the other user's ID (for the room)
    const otherUserId = room.split('-').find(id => id !== user.id);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: otherUserId,
        content,
        type,
        image_url: imageUrl,
        room
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  };

  const markAsRead = async (messageId) => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const addReaction = async (messageId, emoji) => {
    if (!user) return;

    const { error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji
      });

    if (error) {
      console.error('Error adding reaction:', error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    addReaction,
    refetch: fetchMessages
  };
};

// Custom hook for real-time love notes
export const useRealtimeLoveNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch initial notes
  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('love_notes')
        .select(`
          *,
          author:author_id (id, name, profile_photo_url)
        `)
        .eq('is_active', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching love notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = subscribeToChannel(
      'love_notes',
      'love_notes',
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        if (eventType === 'INSERT' && newRecord.is_active) {
          setNotes(prev => [newRecord, ...prev]);
        } else if (eventType === 'UPDATE') {
          setNotes(prev => prev.map(note => 
            note.id === newRecord.id ? { ...note, ...newRecord } : note
          ));
        } else if (eventType === 'DELETE') {
          setNotes(prev => prev.filter(note => note.id !== oldRecord.id));
        }
      }
    );

    return () => {
      removeChannel(channel);
    };
  }, []);

  const createNote = async (noteData) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('love_notes')
      .insert({
        author_id: user.id,
        ...noteData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return null;
    }

    return data;
  };

  const updateNote = async (noteId, noteData) => {
    const { error } = await supabase
      .from('love_notes')
      .update(noteData)
      .eq('id', noteId);

    if (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    const { error } = await supabase
      .from('love_notes')
      .update({ is_active: false })
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
    }
  };

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes
  };
};

// Custom hook for real-time bucket list
export const useRealtimeBucketList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch initial items
  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bucket_list_items')
        .select(`
          *,
          creator:created_by (id, name, profile_photo_url),
          completer:completed_by (id, name, profile_photo_url)
        `)
        .eq('is_active', true)
        .order('status', { ascending: true })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching bucket list items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = subscribeToChannel(
      'bucket_list',
      'bucket_list_items',
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        if (eventType === 'INSERT' && newRecord.is_active) {
          setItems(prev => [...prev, newRecord]);
        } else if (eventType === 'UPDATE') {
          setItems(prev => prev.map(item => 
            item.id === newRecord.id ? { ...item, ...newRecord } : item
          ));
        } else if (eventType === 'DELETE') {
          setItems(prev => prev.filter(item => item.id !== oldRecord.id));
        }
      }
    );

    return () => {
      removeChannel(channel);
    };
  }, []);

  const createItem = async (itemData) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('bucket_list_items')
      .insert({
        created_by: user.id,
        ...itemData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bucket list item:', error);
      return null;
    }

    return data;
  };

  const updateItem = async (itemId, itemData) => {
    const { error } = await supabase
      .from('bucket_list_items')
      .update(itemData)
      .eq('id', itemId);

    if (error) {
      console.error('Error updating bucket list item:', error);
    }
  };

  const deleteItem = async (itemId) => {
    const { error } = await supabase
      .from('bucket_list_items')
      .update({ is_active: false })
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting bucket list item:', error);
    }
  };

  const completeItem = async (itemId) => {
    if (!user) return;

    const { error } = await supabase
      .from('bucket_list_items')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: user.id
      })
      .eq('id', itemId);

    if (error) {
      console.error('Error completing bucket list item:', error);
    }
  };

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    completeItem,
    refetch: fetchItems
  };
};

export default {
  useRealtimeMessages,
  useRealtimeLoveNotes,
  useRealtimeBucketList
};