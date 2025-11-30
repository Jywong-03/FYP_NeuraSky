'use client'

import React, { useState, useEffect } from 'react';
import { Dashboard } from '../components/Dashboard'; // Import your component
import { useRouter } from 'next/navigation';
import { api } from '../../utils/api';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  // This function fetches the user's data
  useEffect(() => {
    async function fetchUserData() {
      try {
        // We don't need to manually check for token here, api.get will handle 401
        // But we might want to check if we have a token at all to avoid unnecessary calls
        const localToken = localStorage.getItem('authToken');
        if (!localToken) {
           router.push('/login');
           return;
        }
        setToken(localToken);

        const userData = await api.get('/profile/');
        setUser(userData);
      } catch (error) {
        console.error(error.message);
        // If api.get failed and didn't redirect (e.g. network error), we might want to handle it
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  // --- Navigation Functions ---
  
  const handleNavigate = (page) => {
    // 'page' will be 'dashboard', 'my-flights', 'profile', 'settings'
    router.push(`/${page}`);
  };

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  // --- Render Component ---

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  if (!user) {
    // This will be brief as the useEffect will redirect to login
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  // Once data is loaded, render your Dashboard component
  // It has the Navigation inside it already
  return (
    <Dashboard 
      user={user} 
      authToken={token}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}