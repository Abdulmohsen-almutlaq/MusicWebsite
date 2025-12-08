import React, { useState, useEffect } from 'react';
import { User, Settings, Bell, Volume2, Shield, Trash2 } from 'lucide-react';

const SettingsView = ({ 
  user, 
  handleUpdateProfile, 
  handleChangePassword, 
  handleDeleteAccount 
}) => {
  // Local State for Forms
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsIsPrivate, setSettingsIsPrivate] = useState(false);
  const [settingsNotifications, setSettingsNotifications] = useState(true);
  const [settingsHighQuality, setSettingsHighQuality] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Initialize settings state when user loads
  useEffect(() => {
    if (user) {
      setSettingsUsername(user.username || '');
      setSettingsIsPrivate(user.isPrivate || false);
    }
  }, [user]);

  const onSaveProfile = async () => {
    await handleUpdateProfile(settingsUsername, settingsIsPrivate);
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    const success = await handleChangePassword(currentPassword, newPassword);
    if (success) {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold mb-8">Settings</h2>

      {/* Account Settings */}
      <section className="bg-brand-medium/30 border border-brand-light/10 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-brand-light/10 bg-brand-medium/50">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <User size={20} className="text-brand-light" /> Account
          </h3>
        </div>
        <div className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-brand-light uppercase">Username</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={settingsUsername} 
                  onChange={(e) => setSettingsUsername(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-light/20 rounded-lg px-4 py-2.5 text-brand-beige focus:border-brand-light outline-none transition-colors" 
                />
                {settingsUsername !== user.username && (
                  <button onClick={onSaveProfile} className="bg-brand-light text-brand-beige px-4 rounded-lg text-sm font-bold hover:bg-brand-light/80">
                    Save
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-brand-light uppercase">Email</label>
              <input type="email" defaultValue={user.email} className="w-full bg-brand-dark border border-brand-light/20 rounded-lg px-4 py-2.5 text-brand-beige focus:border-brand-light outline-none transition-colors opacity-50 cursor-not-allowed" disabled />
            </div>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="text-sm text-brand-light hover:text-brand-beige underline"
            >
              Change Password
            </button>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="bg-brand-medium/30 border border-brand-light/10 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-brand-light/10 bg-brand-medium/50">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Settings size={20} className="text-brand-light" /> Preferences
          </h3>
        </div>
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-dark rounded-lg text-brand-light"><Bell size={18} /></div>
              <div>
                <p className="font-medium text-brand-beige">Notifications</p>
                <p className="text-xs text-brand-light/60">Receive updates about new tracks</p>
              </div>
            </div>
            <div 
              onClick={() => setSettingsNotifications(!settingsNotifications)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settingsNotifications ? 'bg-brand-light' : 'bg-brand-dark border border-brand-light/30'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${settingsNotifications ? 'right-1 bg-brand-beige' : 'left-1 bg-brand-light/50'}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-dark rounded-lg text-brand-light"><Volume2 size={18} /></div>
              <div>
                <p className="font-medium text-brand-beige">High Quality Audio</p>
                <p className="text-xs text-brand-light/60">Stream in lossless format when available</p>
              </div>
            </div>
            <div 
              onClick={() => setSettingsHighQuality(!settingsHighQuality)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settingsHighQuality ? 'bg-brand-light' : 'bg-brand-dark border border-brand-light/30'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${settingsHighQuality ? 'right-1 bg-brand-beige' : 'left-1 bg-brand-light/50'}`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="bg-brand-medium/30 border border-brand-light/10 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-brand-light/10 bg-brand-medium/50">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Shield size={20} className="text-brand-light" /> Privacy
          </h3>
        </div>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-brand-beige">Private Profile</p>
              <p className="text-xs text-brand-light/60">Only followers can see your playlists</p>
            </div>
            <div 
              onClick={() => {
                const newVal = !settingsIsPrivate;
                setSettingsIsPrivate(newVal);
                handleUpdateProfile(settingsUsername, newVal);
              }}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settingsIsPrivate ? 'bg-brand-light' : 'bg-brand-dark border border-brand-light/30'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${settingsIsPrivate ? 'right-1 bg-brand-beige' : 'left-1 bg-brand-light/50'}`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="border border-red-900/30 rounded-2xl overflow-hidden bg-red-900/5">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-red-400 font-bold mb-1">Delete Account</h3>
            <p className="text-xs text-red-400/60">Permanently remove your account and all data</p>
          </div>
          <button 
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/30 rounded-lg text-sm font-medium hover:bg-red-900/40 transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </section>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-medium border border-brand-light/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Change Password</h3>
            <form onSubmit={onChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-light">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-light/20 rounded-lg px-4 py-3 text-brand-beige focus:border-brand-light outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-light">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-light/20 rounded-lg px-4 py-3 text-brand-beige focus:border-brand-light outline-none"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-transparent border border-brand-light/20 text-brand-beige py-3 rounded-xl font-bold hover:bg-brand-light/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-brand-light text-brand-beige py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
