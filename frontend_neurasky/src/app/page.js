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

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Django's login endpoint uses 'username' and 'password'
        // We agreed to use the email as the username
        body: JSON.stringify({ username: email, password: password }),
      });

      if (!response.ok) {
        // Handle login failure (e.g., show toast error)
        console.error('Login failed');
        return;
      }

      const data = await response.json();
      // data.access contains the JWT token. You'll need to save this.
      console.log('Login successful:', data); 

      // Mock user for now, we'll fix this next
      setUser({
        id: '1',
        name: 'Alex Johnson', // We'll get this from the token later
        email: email,
      });
      setCurrentPage('dashboard');

    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // We set this up in the RegisterSerializer in api/serializers.py
        body: JSON.stringify({
          email: email,
          password: password,
          first_name: name, // This matches your serializer
        }),
      });

      if (!response.ok) {
        // Handle register failure
        console.error('Registration failed');
        return;
      }

      const data = await response.json();
      console.log('Registration successful:', data);

      // After registering, automatically log them in
      handleLogin(email, password);

    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
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
        />
      )}
      
      {currentPage === 'my-flights' && (
        <MyFlights 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
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
