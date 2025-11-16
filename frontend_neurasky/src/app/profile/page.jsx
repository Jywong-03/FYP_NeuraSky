'use client'

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../components/UserProfile'; // Import your component
import { useRouter } from 'next/navigation';

// This is a new "page" component that will use your UserProfile component
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // This function fetches the data from your backend
  useEffect(() => {
    async function fetchData() {
      try {
        // --- THIS IS THE NEW PART ---
        // 1. Get the auth token. (You MUST get this from where you store it after login,
        //    e.g., localStorage, cookies)
        const token = localStorage.getItem('authToken'); 
        if (!token) {
          // If no token, send to login
          router.push('/login');
          return;
        }

        const apiHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Or `Token ${token}` depending on your Django setup
        };

        // 2. Define your API URLs (replace with your real URLs)
        const USER_API_URL = 'http://127.0.0.1:8000/api/user/profile/'; 
        const STATS_API_URL = 'http://127.0.0.1:8000/api/flights/stats/';

        // 3. Fetch data in parallel
        const [userRes, statsRes] = await Promise.all([
          fetch(USER_API_URL, { headers: apiHeaders }),
          fetch(STATS_API_URL, { headers: apiHeaders })
        ]);

        if (!userRes.ok || !statsRes.ok) {
          // If fetching fails (e.g., 401 Unauthorized), go to login
          console.error("Failed to fetch data");
          router.push('/login');
          return;
        }

        const userData = await userRes.json();
        const statsData = await statsRes.json();

        // 4. Set state with real data
        setUser(userData);
        setStats(statsData);
        
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);
  // --- Define Navigation Functions ---
  
  const handleNavigate = (page) => {
    router.push(`/${page}`); // Example navigation
  };

  const handleLogout = () => {
    // TODO: Call your backend logout endpoint
    console.log("Logging out...");
    router.push('/login'); // Redirect to login
  };

  // --- Render Component ---

  if (loading) {
    return <div>Loading profile...</div>; // Show a loading state
  }

  if (!user || !stats) {
    return <div>Could not load profile data.</div>; // Show an error state
  }

  // Once data is loaded, render your component with the fetched data
  return (
    <UserProfile 
      user={user} 
      travelStats={stats} 
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}