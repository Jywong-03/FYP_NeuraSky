'use client'

import React, { useState, useEffect } from 'react';
import { HistoricalTrendsPage } from '../components/HistoricalTrendsPage'; // Import your component
import { useRouter } from 'next/navigation';

export default function HistoricalTrends() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // This function fetches the user's data (for the navigation bar)
  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // This API call is for the user data in the nav bar
        const response = await fetch('http://127.0.0.1:8000/api/profile/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      
      } catch (error) {
        console.error(error.message);
        localStorage.removeItem('authToken');
        router.push('/login');
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  // --- Render Component ---

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading analytics...</div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>;
  }

  // Render your HistoricalTrendsPage component
  return (
    <HistoricalTrendsPage 
      user={user} 
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}