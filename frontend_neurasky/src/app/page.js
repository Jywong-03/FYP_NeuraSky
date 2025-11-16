'use client'

import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { MyFlights } from './components/MyFlights';
import { UserProfile } from './components/UserProfile';
import { AccountSettings } from './components/AccountSettings';
import { DelayDurationPage } from './components/DelayDurationPage';
import { DelayReasonsPage } from './components/DelayReasonsPage';
import { HistoricalTrendsPage } from './components/HistoricalTrendsPage';
import { Toaster } from './components/ui/sonner';

const API_URL = 'http://127.0.0.1:8000/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_URL}/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Send the token
        },
      });
      const userData = await response.json();

      if (response.ok) {
        // Save the user data to state
        setUser({
          id: userData.id,
          name: userData.first_name, // 'first_name' from your serializer
          email: userData.email,
        });
        setCurrentPage('dashboard');
      } else {
        // Handle error, e.g., token expired
        handleLogout();
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Django's login uses 'username' and 'password'
        // We set the username to be the email
        body: JSON.stringify({ username: email, password: password }),
      });

      if (!response.ok) {
        // You can add a toast notification here
        console.error('Login failed');
        return;
      }

      const data = await response.json();
      // Save the token
      setAuthToken(data.access);

      // Now that we have a token, fetch the user's profile
      await fetchUserProfile(data.access);

    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          first_name: name, // Matches your RegisterSerializer
        }),
      });

      if (!response.ok) {
        console.error('Registration failed');
        return;
      }

      // After registering, automatically log them in
      await handleLogin(email, password);

    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null); // Clear the token
    setCurrentPage('login');
  };

  if (!user && currentPage !== 'register') {
    return (
      <>
        <LoginPage 
          onLogin={handleLogin} 
          onSwitchToRegister={() => setCurrentPage('register')}
        />
        <Toaster />
      </>
    );
  }

  if (!user && currentPage === 'register') {
    return (
      <>
        <RegisterPage 
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentPage('login')}
        />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-sky-50 to-cyan-50">
      <Toaster />
      
      {currentPage === 'dashboard' && (
        <Dashboard 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          authToken={authToken}
        />
      )}
      
      {currentPage === 'my-flights' && (
        <MyFlights 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          authToken={authToken}
        />
      )}
      
      {currentPage === 'profile' && (
        <UserProfile 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'settings' && (
        <AccountSettings 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          authToken={authToken}
        />
      )}
      
      {currentPage === 'delay-duration' && (
        <DelayDurationPage 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'delay-reasons' && (
        <DelayReasonsPage 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'historical-trends' && (
        <HistoricalTrendsPage 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
