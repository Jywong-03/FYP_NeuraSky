'use client'

import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Skeleton } from './ui/skeleton';

// --- FIX 1: API_URL moved *outside* the component ---
const API_URL = 'http://127.0.0.1:8000/api';

export function AccountSettings({ user, onNavigate, onLogout }) {
  
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- API_URL constant removed from here ---

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/profile/settings/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []); // --- FIX 2: Dependency array is now empty ---

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      const token = getAuthToken();
      // --- FIX 3: Corrected API URL (was /change-password/, should be /profile/change-password/)
      const response = await fetch(`${API_URL}/profile/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword, // --- FIX 4: Send currentPassword (not current_password) ---
          newPassword: newPassword, // --- FIX 5: Send newPassword (not new_password) ---
        })
      });

      const data = await response.json();
      if (!response.ok) {
        // Use data.error from the backend response
        throw new Error(data.error || 'Failed to change password');
      }
      
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = getAuthToken();
      // --- FIX 6: Corrected API URL (was /delete-account/, should be /profile/delete/) ---
      const response = await fetch(`${API_URL}/profile/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      toast.success('Account deleted successfully');
      onLogout(); // Log the user out
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSettingsChange = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/profile/settings/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: value })
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error(error.message);
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  return (
    <>
      <Navigation user={user} currentPage="settings" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-sky-900 mb-2">Settings</h1>
          <p className="text-sky-700">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          
          {/* --- Loading Skeleton (shows when settingsLoading is true) --- */}
          {settingsLoading && (
            <>
              <Card className="border-sky-100">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-sky-100">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
              <Card className="border-red-200">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            </>
          )}

          {/* --- Actual Content (shows when settingsLoading is false and settings exist) --- */}
          {!settingsLoading && settings && (
            <>
              <Card className="border-sky-100">
                <CardHeader>
                  <CardTitle className="text-sky-900">Notification Preferences</CardTitle>
                  <CardDescription>Control how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sky-900">Email Notifications</p>
                      <p className="text-sky-600">Receive alerts via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(newValue) => handleSettingsChange('emailNotifications', newValue)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sky-900">Push Notifications</p>
                      <p className="text-sky-600">Receive alerts on your device</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(newValue) => handleSettingsChange('pushNotifications', newValue)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sky-900">Delay Alerts</p>
                      <p className="text-sky-600">Notify me about flight delays</p>
                    </div>
                    <Switch
                      id="delay-alerts"
                      checked={settings.delayAlerts}
                      onCheckedChange={(newValue) => handleSettingsChange('delayAlerts', newValue)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sky-900">Weekly Digest</p>
                      <p className="text-sky-600">A summary of your flight activity</p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={settings.weeklyDigest}
                      onCheckedChange={(newValue) => handleSettingsChange('weeklyDigest', newValue)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-sky-100">
                <CardHeader>
                  <CardTitle className="text-sky-900">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-900">Delete Account</CardTitle>
                  <CardDescription>Permanently delete your account and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </>
          )} 
          {/* --- FIX 7: This is the correct place for the closing bracket --- */}

        </div>
      </main>
    </>
  );
}