'use client'

import React, { useState } from 'react';
import { LoginPage } from '../components/LoginPage'; // Import the "dumb" component
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../../utils/api';

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();

  // This is the real onLogin function
  const handleLogin = async (email, password) => {
    setError(''); // Clear old errors
    try {
      await api.login(email, password);

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