'use client'
import { useEffect } from 'react';
import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { MyFlights } from './components/MyFlights';
import { Predict } from './components/Predict';
import { Analytics } from './components/Analytics';
import { UserProfile } from './components/UserProfile';
import { AccountSettings } from './components/AccountSettings';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { API_BASE_URL } from './config';

export default function App() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // This component will run when a user visits "/"
    // We will check for a token and redirect them.
    
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // If they have a token, send them to their profile
      router.push('/dashboard');
    } else {
      // If not, send them to the login page
      router.push('/login');
    }
  }, [router]);

  // Show a simple loading text while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/`, {
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
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Django's login uses 'username' and 'password'
        // We set the username to be the email
        body: JSON.stringify({ username: email, password: password }),
      });

      if (!response.ok) {
        toast.error('Login failed. Please check your credentials.');
        console.error('Login failed');
        return;
      }

      const data = await response.json();
      // Save the token
      setAuthToken(data.access);

      // Now that we have a token, fetch the user's profile
      await fetchUserProfile(data.access);
      toast.success('Login successful! Welcome back.');

    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
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
        toast.error('Registration failed. Please try again.');
        console.error('Registration failed');
        return;
      }

      // After registering, automatically log them in
      toast.success('Registration successful! Logging you in...');
      await handleLogin(email, password);

    } catch (error) {
      console.error('An error occurred:', error);
    }
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
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setCurrentPage('login');
      toast.success('Logged out successfully');
    }
  };

  if (!user && currentPage !== 'register') {
    return (
      <>
        <LoginPage 
          onLogin={handleLogin} 
          onSwitchToRegister={() => setCurrentPage('register')}
        />
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
      </>
    );
  }


  
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-sky-50 to-cyan-50">
      
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
      
      {currentPage === 'predict' && (
        <Predict 
          user={user} 
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          authToken={authToken}
        />
      )}

      {currentPage === 'analytics' && (
        <Analytics 
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
      
      
      
    
    </div>
  );
}
