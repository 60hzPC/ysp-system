'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { LoadingPage } from '@/components/Loading';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useFirestore } from '@/hooks/useFirestore';

export default function SettingsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { updateDocument } = useFirestore();

  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  React.useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || '',
        email: userProfile.email || '',
      });
    }
  }, [userProfile]);

  if (authLoading) return <LoadingPage />;
  if (!user || !userProfile) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.name) {
      toast.error('Name is required');
      return;
    }

    setIsUpdatingProfile(true);

    try {
      await updateDocument('volunteers', user.uid, {
        name: profileForm.name,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      if (user) {
        await updatePassword(user, passwordForm.newPassword);
        toast.success('Password updated successfully!');
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please logout and login again to change your password');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Your name"
                fullWidth
              />
              <Input
                label="Email Address"
                value={profileForm.email}
                disabled
                fullWidth
                className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email address cannot be changed. Contact admin if you need to update it.
              </p>
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Role:</strong> {userProfile.role}</p>
                  <p><strong>Chapter:</strong> {userProfile.chapter}</p>
                  <p><strong>Status:</strong> <span className={`font-semibold ${
                    userProfile.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                  }`}>{userProfile.status}</span></p>
                </div>
                <Button type="submit" isLoading={isUpdatingProfile}>
                  Update Profile
                </Button>
              </div>
            </form>
          </Card>

          {/* Password Settings */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Change Password
            </h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
                fullWidth
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                fullWidth
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters long.
              </p>
              <div className="pt-4">
                <Button type="submit" isLoading={isUpdatingPassword}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Theme
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred color scheme
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === 'light' ? (
                  <>
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Dark</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Light</span>
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* Account Information */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Account Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">User ID</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">
                  {user.uid}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Account Created</span>
                <span className="text-gray-900 dark:text-white">
                  {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Last Sign In</span>
                <span className="text-gray-900 dark:text-white">
                  {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Email Verified</span>
                <span className={`font-semibold ${user.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {user.emailVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </Card>

          {/* Notifications (Placeholder) */}
          <Card className="opacity-60">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Notifications
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Email notification settings coming soon...
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Project Updates</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about project changes</p>
                </div>
                <input type="checkbox" disabled className="rounded border-gray-300" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Application Status</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Updates on your applications</p>
                </div>
                <input type="checkbox" disabled className="rounded border-gray-300" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
