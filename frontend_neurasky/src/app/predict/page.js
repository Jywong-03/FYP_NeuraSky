'use client'

import React, { useState, useEffect } from 'react';
import { PredictionPage } from '../components/PredictionPage';
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';

export default function PredictPageRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const localToken = localStorage.getItem('authToken');
        if (!localToken) {
           router.push('/login');
           return;
        }

        const userData = await api.get('/profile/');
        setUser(userData);
      } catch (error) {
        console.error(error);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sky-600">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center text-sky-600">Redirecting...</div>;

  return (
    <PredictionPage 
      user={user} 
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}
