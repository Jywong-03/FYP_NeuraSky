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

  const handleLogin = (email, password) => {
    // Mock login
    setUser({
      id: '1',
      name: 'Alex Johnson',
      email: email,
      avatar: undefined
    });
    setCurrentPage('dashboard');
  };

  const handleRegister = (name, email, password) => {
    // Mock register
    setUser({
      id: '1',
      name: name,
      email: email,
      avatar: undefined
    });
    setCurrentPage('dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
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
