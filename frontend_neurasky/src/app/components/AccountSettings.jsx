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
import { api } from '../../utils/api';

export function AccountSettings({ user, onNavigate, onLogout }) {
  
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get('/profile/settings/');
        setSettings(data);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      await api.post('/profile/change-password/', {
        currentPassword: currentPassword,
        newPassword: newPassword,
      });
      
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
      await api.delete('/profile/delete/');
      
      toast.success('Account deleted successfully');
      onLogout(); // Log the user out
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSettingsChange = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    try {
      await api.patch('/profile/settings/', { [key]: value });
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error(error.message);
      setSettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-ios-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      </div>

      <Navigation user={user} currentPage="settings" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1E293B] mb-2">Settings</h1>
          <p className="text-[#64748B]">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          
          {settingsLoading && (
            <>
              <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
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
              <Card className="border-red-200/50 bg-red-50/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
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

          {!settingsLoading && settings && (
            <>
              <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                  <CardTitle className="text-[#1E293B]">Notification Preferences</CardTitle>
                  <CardDescription className="text-[#64748B]">Control how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#1E293B] font-medium">Email Notifications</p>
                      <p className="text-sm text-[#64748B]">Receive alerts via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(newValue) => handleSettingsChange('emailNotifications', newValue)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#1E293B] font-medium">Push Notifications</p>
                      <p className="text-sm text-[#64748B]">Receive alerts on your device</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(newValue) => handleSettingsChange('pushNotifications', newValue)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#1E293B] font-medium">Delay Alerts</p>
                      <p className="text-sm text-[#64748B]">Notify me about flight delays</p>
                    </div>
                    <Switch
                      id="delay-alerts"
                      checked={settings.delayAlerts}
                      onCheckedChange={(newValue) => handleSettingsChange('delayAlerts', newValue)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#1E293B] font-medium">Weekly Digest</p>
                      <p className="text-sm text-[#64748B]">A summary of your flight activity</p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={settings.weeklyDigest}
                      onCheckedChange={(newValue) => handleSettingsChange('weeklyDigest', newValue)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <CardHeader>
                  <CardTitle className="text-[#1E293B]">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-[#1E293B]">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-[#1E293B]">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-[#1E293B]">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-white/50"
                      />
                    </div>
                    <Button type="submit" className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white">
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Delete Account</CardTitle>
                  <CardDescription>Permanently delete your account and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white shadow-sm">Delete Account</Button>
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

        </div>
      </main>
    </div>
  );
}