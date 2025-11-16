'use client'

import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Bell, Mail, Smartphone } from 'lucide-react';
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

const API_URL = 'http://127.0.0.1:8000/api';

export function AccountSettings({ user, onNavigate, onLogout, authToken }) {
  // --- STATE FOR NOTIFICATIONS ---
  // We'll set these AFTER we fetch them
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [delayAlerts, setDelayAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false); // For loading state

  const [isDeleting, setIsDeleting] = useState(false);

useEffect(() => {
    const fetchSettings = async () => {
      if (!authToken) return;

      try {
        const response = await fetch(`${API_URL}/profile/settings/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const settings = await response.json();
        
        // Update state with fetched data
        setEmailNotifications(settings.emailNotifications);
        setPushNotifications(settings.pushNotifications);
        setDelayAlerts(settings.delayAlerts);
        setWeeklyDigest(settings.weeklyDigest);

      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast.error('Could not load your settings.');
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [authToken]); // Re-run if authToken changes

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/profile/settings/`, {
        method: 'PUT', // Use PUT to update
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          emailNotifications: emailNotifications,
          pushNotifications: pushNotifications,
          delayAlerts: delayAlerts,
          weeklyDigest: weeklyDigest,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast.success('Notification preferences saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Could not save your preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` // Send the token
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to update password.');
      } else {
        toast.success(data.message || 'Password updated successfully!');
        // Clear the form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/profile/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast.success('Account deleted successfully.');
      onLogout(); // This will log the user out and return them to the login page

    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Could not delete account. Please try again.');
      setIsDeleting(false);
    }
    // No 'finally' block needed, as onLogout() navigates away
  };

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="settings" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-sky-900 mb-2">Account Settings</h1>
          <p className="text-sky-700">Manage your preferences and security</p>
        </div>

        <div className="space-y-6">
          {/* Notification Settings */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="text-sky-900">Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-sky-900">Email Notifications</p>
                    <p className="text-sky-600">Receive updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={isLoadingSettings} // Disable while loading
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-sky-900">Push Notifications</p>
                    <p className="text-sky-600">Get instant alerts on your device</p>
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  disabled={isLoadingSettings}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-sky-900">Delay Alerts</p>
                    <p className="text-sky-600">Real-time notifications for flight delays</p>
                  </div>
                </div>
                <Switch
                  checked={delayAlerts}
                  onCheckedChange={setDelayAlerts}
                  disabled={isLoadingSettings}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-sky-900">Weekly Digest</p>
                    <p className="text-sky-600">Summary of your upcoming flights</p>
                  </div>
                </div>
                <Switch
                  checked={weeklyDigest}
                  onCheckedChange={setWeeklyDigest}
                  disabled={isLoadingSettings}
                />
              </div>

              <Button 
                onClick={handleSaveNotifications} // Connects to new function
                className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                disabled={isSaving || isLoadingSettings} // Disable while saving/loading
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="text-sky-900">Security</CardTitle>
              <CardDescription>Update your password and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    className="border-sky-200"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="border-sky-200"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="border-sky-200"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
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
                      This action cannot be undone. This will permanently delete
                      your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, delete account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
