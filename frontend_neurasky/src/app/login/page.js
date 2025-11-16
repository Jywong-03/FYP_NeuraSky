'use client'

import React, { useState } from 'react';
import { LoginPage } from '../components/LoginPage'; // Import the "dumb" component
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();

  // This is the real onLogin function
  const handleLogin = async (email, password) => {
    setError(''); // Clear old errors
    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email, // Send email
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      
      // THIS IS THE MOST IMPORTANT STEP
      localStorage.setItem('authToken', data.access); // Save the token!
      
      // We can also save the refresh token
      localStorage.setItem('refreshToken', data.refresh);

      toast.success("Login Successful!", {
        description: "Redirecting to your profile...",
      });

      // Send the user to their profile page
      router.push('/dashboard');

    } catch (err) {
      setError(err.message);
      toast.error("Login Failed", {
        description: "Please check your email and password.",
      });
    }
  };

  const handleSwitchToRegister = () => {
    router.push('/register'); // Or wherever your register page is
  };

  // Render your "dumb" component and pass it the real functions
  return (
    <>
      <LoginPage 
        onLogin={handleLogin} 
        onSwitchToRegister={handleSwitchToRegister} 
      />
      {/* You can optionally display the error message */}
      {error && (
        <div className="text-red-500 text-center mt-4">{error}</div>
      )}
    </>
  );
}