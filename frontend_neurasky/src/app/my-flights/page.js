'use client'

import React, { useState, useEffect } from 'react';
import { MyFlights } from '../components/MyFlights'; // Import your component
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '../config';

export default function MyFlightsPage() {
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
        const response = await fetch(`${API_BASE_URL}/profile/`, {
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

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const token = localStorage.getItem('authToken');
      
      if (refreshToken && token) {
        await fetch(`${API_BASE_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
      }
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    }
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