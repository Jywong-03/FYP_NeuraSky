'use client'

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../components/UserProfile';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [travelStats, setTravelStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch User Profile
        const profileData = await api.get('/profile/');
        setUser(profileData);

        // 2. Fetch Flight Stats
        const statsData = await api.get('/flights/stats/');
        setTravelStats(statsData);

      } catch (error) {
        console.error(error);
        toast.error('Error fetching profile data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleNavigate = (page) => {
    router.push(`/${page}`);
  };

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <UserProfile 
      user={user}
      travelStats={travelStats}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}