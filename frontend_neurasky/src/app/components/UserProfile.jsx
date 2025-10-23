'use client'

import React from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Mail, Calendar, Plane, Clock } from 'lucide-react';

export function UserProfile({ user, onNavigate, onLogout }) {
  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-sky-900 mb-2">Profile</h1>
          <p className="text-sky-700">Manage your account information</p>
        </div>

        <div className="space-y-6">
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="text-sky-900">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-cyan-500 text-white text-3xl">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sky-900 mb-1">{user.name}</h2>
                  <div className="flex items-center gap-2 text-sky-600">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-sky-100">
                <div>
                  <p className="text-sky-600 mb-1">Member Since</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    <span className="text-sky-900">October 2024</span>
                  </div>
                </div>
                <div>
                  <p className="text-sky-600 mb-1">Account Type</p>
                  <Badge className="bg-linear-to-r from-blue-500 to-cyan-500">Premium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="text-sky-900">Travel Statistics</CardTitle>
              <CardDescription>Your flight tracking history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-sky-50 rounded-lg">
                  <Plane className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                  <p className="text-sky-900 mb-1">12</p>
                  <p className="text-sky-600">Flights Tracked</p>
                </div>
                <div className="text-center p-4 bg-sky-50 rounded-lg">
                  <Clock className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                  <p className="text-sky-900 mb-1">3</p>
                  <p className="text-sky-600">Delay Alerts</p>
                </div>
                <div className="text-center p-4 bg-sky-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                  <p className="text-sky-900 mb-1">5</p>
                  <p className="text-sky-600">Upcoming Flights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
