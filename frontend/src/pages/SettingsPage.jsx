import { useState } from 'react';
import { Settings, User, Bell, Lock, LogOut, Heart, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile(profileData);
      toast.success('Profile updated! 💕');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'account', label: 'Account', icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          <Settings className="inline-block w-10 h-10 text-pink-500 mr-2" />
          Settings
        </h1>
        <p className="text-gray-400">
          Manage your account settings
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <nav className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-6 py-4 flex items-center gap-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pink-500/20 text-pink-500 border-r-4 border-pink-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Profile Settings
                </h2>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 
                               bg-gray-800/50 text-white placeholder-gray-500
                               focus:border-pink-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 
                               bg-gray-800/50 text-white placeholder-gray-500
                               focus:border-pink-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-400">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 
                               text-white rounded-xl font-medium hover:opacity-90 
                               transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Notification Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-white">
                        New Messages
                      </h3>
                      <p className="text-sm text-gray-400">
                        Get notified when you receive new messages
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 
                                   dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-600 
                                   peer-checked:after:translate-x-full peer-checked:after:border-white 
                                   after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                   after:bg-white after:border-gray-300 after:border after:rounded-full 
                                   after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                                   peer-checked:bg-pink-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-white">
                        New Letters
                      </h3>
                      <p className="text-sm text-gray-400">
                        Get notified when you receive new letters
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 
                                   dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-600 
                                   peer-checked:after:translate-x-full peer-checked:after:border-white 
                                   after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                   after:bg-white after:border-gray-300 after:border after:rounded-full 
                                   after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                                   peer-checked:bg-pink-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-white">
                        Special Reminders
                      </h3>
                      <p className="text-sm text-gray-400">
                        Get reminded about special dates and events
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 
                                   dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-600 
                                   peer-checked:after:translate-x-full peer-checked:after:border-white 
                                   after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                   after:bg-white after:border-gray-300 after:border after:rounded-full 
                                   after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                                   peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Security Settings
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-white mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 
                                 bg-gray-800/50 text-white placeholder-gray-500
                                 focus:border-pink-500 focus:outline-none transition-colors"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 
                                 bg-gray-800/50 text-white placeholder-gray-500
                                 focus:border-pink-500 focus:outline-none transition-colors"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-700 
                                 bg-gray-800/50 text-white placeholder-gray-500
                                 focus:border-pink-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <button className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 
                                     text-white rounded-xl font-medium hover:opacity-90 
                                     transition-opacity">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  Account Settings
                </h2>

                <div className="space-y-6">
                  <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-700">
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                      These actions are irreversible. Please proceed with caution.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium 
                               hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span>Made with love for Ajesh & Shofi</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;