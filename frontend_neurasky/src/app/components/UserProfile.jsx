'use client'

import React from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Mail, Calendar, Plane, Clock, MapPin, User } from 'lucide-react';

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
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="fixed inset-0 -z-10 bg-background" />

      <Navigation user={user} currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Corporate Hero Header */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
             <User className="w-8 h-8" />
             User Profile
          </h1>
          <p className="text-blue-100 opacity-90">Manage your account settings and preferences</p>
        </div>
      </div>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header content moved to Hero Banner */ }

        <div className="space-y-6">
          <Card className="bg-white border border-border border-t-4 border-t-primary shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-foreground tracking-tight">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
                <div className="relative">
                   <div className="absolute top-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                   <Avatar className="w-24 h-24 border-2 border-primary/20 shadow-2xl relative z-10">
                    <AvatarFallback className="bg-linear-to-br from-gray-900 to-black text-primary text-3xl font-bold border border-border">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </AvatarFallback>
                    </Avatar>
                </div>
                
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">{user.name || 'User Name'}</h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{user.email || 'user@example.com'}</span>
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 mt-2">
                    Premium Member
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 mt-2 border-t border-dashed border-border">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Member Since</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {/* This now reads from the 'user' prop */}
                    <span className="text-foreground font-mono">{formatMemberSince(user.memberSince)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border border-border border-t-4 border-t-green-500 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Flights</CardTitle>
                <Plane className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-foreground">{travelStats?.flightsTracked || 0}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span className="text-green-500 font-medium">+2</span> form last month
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-border border-t-4 border-t-red-500 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Delay Alerts</CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-foreground">{travelStats?.delayAlerts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span className="text-red-500 font-medium">+5</span> new alerts
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-border border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Upcoming Flights</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-mono font-bold text-foreground">{travelStats?.upcomingFlights || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Next flight in <span className="text-foreground font-medium">3 days</span></p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
