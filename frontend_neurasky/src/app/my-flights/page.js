'use client'

import React, { useState, useEffect } from 'react';
import { MyFlights } from '../components/MyFlights';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';

export default function MyFlightsPage() {
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

  // --- Navigation Functions ---
  
  const handleNavigate = (page) => {
    router.push(`/${page}`);
  };

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  // --- Render Component ---

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading flights...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  // Render your MyFlights component
  // It will fetch its own list of flights internally
  return (
    <MyFlights 
      user={user} 
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}