'use client'

import React from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Mail, Calendar, Plane, Clock, MapPin } from 'lucide-react';

export function UserProfile({ user, travelStats, onNavigate, onLogout }) {

const formatMemberSince = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Fallback to the original string
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-ios-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/10 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob animation-delay-2000" />
      </div>

      <Navigation user={user} currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1E293B] mb-2">Profile</h1>
          <p className="text-[#64748B]">Manage your account information</p>
        </div>

        <div className="space-y-6">
          <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-white text-3xl">
                    {user.name ? user.name.charAt(0) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold text-[#1E293B] mb-1">{user.name || 'User Name'}</h2>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <Mail className="w-4 h-4 text-[#007AFF]" />
                    <span className="text-[#007AFF]">{user.email || 'user@example.com'}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-black/5">
                <div>
                  <p className="text-sm font-medium text-[#64748B] mb-1">Member Since</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#007AFF]" />
                    {/* This now reads from the 'user' prop */}
                    <span className="text-[#1E293B] font-medium">{formatMemberSince(user.memberSince)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">Total Flights</CardTitle>
                <Plane className="h-4 w-4 text-[#007AFF]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1E293B]">{travelStats?.flightsTracked || 0}</div>
                <p className="text-xs text-[#64748B]">+2 from last month</p>
              </CardContent>
            </Card>
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">Delay Alerts</CardTitle>
                <Clock className="h-4 w-4 text-[#007AFF]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1E293B]">{travelStats?.delayAlerts || 0}</div>
                <p className="text-xs text-[#64748B]">+5 from last month</p>
              </CardContent>
            </Card>
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#64748B]">Upcoming Flights</CardTitle>
                <Calendar className="h-4 w-4 text-[#007AFF]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1E293B]">{travelStats?.upcomingFlights || 0}</div>
                <p className="text-xs text-[#64748B]">Next flight in 3 days</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
