'use client'

import React, { useState, useEffect } from 'react';
import { Dashboard } from '../components/Dashboard'; // Import your component
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // This function fetches the user's data
  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/profile/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // If the token is bad (e.g., expired), go to login
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      
      } catch (error) {
        console.error(error.message);
        localStorage.removeItem('authToken'); // Clean up bad token
        router.push('/login');
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
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
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}