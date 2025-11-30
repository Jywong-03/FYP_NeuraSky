'use client'

import React, { useState, useEffect } from 'react';
import { DelayDurationPage } from '../components/DelayDurationPage';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';

export default function DelayDuration() {
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
    return <div className="min-h-screen flex items-center justify-center">Loading analytics...</div>;
  }

  if (!user) {
     return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <DelayDurationPage 
      user={user} 
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}