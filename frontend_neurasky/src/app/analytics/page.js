'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';

export default function AnalyticsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await api.get('/profile/');
        setUser(userData);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  const handleNavigate = (page) => {
    router.push(`/${page}`);
  };

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  if (loading) {
     return (
         <div className="min-h-screen flex items-center justify-center bg-background">
             <div className="animate-pulse flex flex-col items-center">
                 <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
                 <div className="h-4 w-32 bg-primary/20 rounded"></div>
             </div>
         </div>
     );
  }

  if (!user) {
     // Optional: Redirect to login if api.js doesn't handle it
     // router.push('/login');
     return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <AnalyticsDashboard 
      user={user} 
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}
