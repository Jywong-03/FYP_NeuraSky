'use client'

import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { toast } from 'sonner';


export function AccountSettings({ user, onNavigate, onLogout }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    toast.success('Password updated successfully!');
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
                />
              </div>

              <Button 
                onClick={handleSaveNotifications}
                className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Save Preferences
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="border-sky-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="border-sky-200"
                  />
                </div>
                <Button 
                  type="submit"
                  className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Update Password
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
              <Button variant="destructive">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
