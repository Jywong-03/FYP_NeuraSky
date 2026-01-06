'use client'

import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Settings, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      setIsLoading(false);
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
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="fixed inset-0 -z-10 bg-background" />

      <Navigation user={user} currentPage="settings" onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Corporate Hero Header */}
      <div className="absolute top-0 w-full h-[300px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="bg-blue-900 text-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
             <Settings className="w-8 h-8" />
             Settings
          </h1>
          <p className="text-blue-100 opacity-90">Manage your account preferences and security</p>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header content moved to Hero Banner */ }

        <div className="space-y-6">
          
          {settingsLoading && (
            <>
              <Card className="bg-card border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2 bg-muted" />
                  <Skeleton className="h-4 w-1/3 bg-muted" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-5 w-1/3 bg-muted" />
                        <Skeleton className="h-6 w-12 bg-muted" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {!settingsLoading && settings && (
            <>
              <Card className="bg-white border border-border border-t-4 border-t-blue-500 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader>
                  <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                  <CardDescription className="text-muted-foreground">Control how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(newValue) => handleSettingsChange('emailNotifications', newValue)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">Delay Alerts</p>
                      <p className="text-sm text-muted-foreground">Notify me about flight delays</p>
                    </div>
                    <Switch
                      id="delay-alerts"
                      checked={settings.delayAlerts}
                      onCheckedChange={(newValue) => handleSettingsChange('delayAlerts', newValue)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-border border-t-4 border-t-primary shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <CardHeader>
                  <CardTitle className="text-foreground">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="bg-white border-border text-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-white border-border text-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-white border-border text-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200"
                      />
                    </div>
                    <Button type="submit" className="bg-blue-600! hover:bg-blue-700! text-white! font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-150">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <CardHeader>
                  <CardTitle className="text-red-700">Delete Account</CardTitle>
                  <CardDescription className="text-red-600/80">Permanently delete your account and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-600! hover:bg-red-700! text-white! font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all duration-150 border-none">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white! dark:bg-zinc-950! border-border text-foreground shadow-xl z-60">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white border-border text-foreground hover:bg-zinc-100">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white border-none">
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