import { useState, useEffect } from 'react';
import { Heart, Plus, X, Calendar, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
const MemoriesPage = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMemory, setNewMemory] = useState({ title: '', description: '', date: '' });

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await axios.get('/memories');
      setMemories(response.data.memories || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast.error('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const addMemory = async (e) => {
    e.preventDefault();
    if (!newMemory.title.trim() || !newMemory.date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const response = await axios.post('/memories', newMemory);
      setMemories([response.data.memory, ...memories]);
      setNewMemory({ title: '', description: '', date: '' });
      setShowAdd(false);
      toast.success('Memory saved! 💕');
    } catch (error) {
      console.error('Error adding memory:', error);
      toast.error('Failed to save memory');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <Heart className="inline-block w-10 h-10 text-pink-500 mr-2" />
            Our Memories
          </h1>
          <p className="text-gray-400">
            Cherished moments together 💕
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 
                   text-white rounded-xl font-medium hover:opacity-90 
                   transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Memory
        </button>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl">
          <Heart className="w-20 h-20 mx-auto mb-4 text-pink-500/50" />
          <h2 className="text-2xl font-bold text-white mb-2">
            No memories yet
          </h2>
          <p className="text-gray-400">
            Start collecting your special moments!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <div
              key={memory._id}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all"
            >
              <div className="h-48 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <Image className="w-16 h-16 text-pink-500/50" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(memory.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {memory.title}
                </h3>
                {memory.description && (
                  <p className="text-gray-400 line-clamp-2">
                    {memory.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Add a Memory
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={addMemory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                  placeholder="What makes this moment special?"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 
                           bg-gray-800/50 text-white placeholder-gray-500
                           focus:border-pink-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newMemory.date}
                  onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 
                           bg-gray-800/50 text-white placeholder-gray-500
                           focus:border-pink-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newMemory.description}
                  onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                  placeholder="What made this moment unforgettable?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 
                           bg-gray-800/50 text-white placeholder-gray-500
                           focus:border-pink-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 
                         text-white rounded-xl font-semibold hover:opacity-90 
                         transition-opacity flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Save Memory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;