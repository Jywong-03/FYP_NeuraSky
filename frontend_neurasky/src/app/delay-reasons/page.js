'use client'

import React, { useState, useEffect } from 'react';
import { DelayReasonsPage } from '../components/DelayReasonsPage';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';

export default function DelayReasons() {
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
        // api.get handles 401 redirect, but if it fails for other reasons, we might want to redirect or show error
        // For now, let's assume api.js handles the critical auth errors.
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

  // If loading is done but no user, api.js likely redirected to login. 
  // But just in case:
  if (!user) {
     return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <DelayReasonsPage 
      user={user} 
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}