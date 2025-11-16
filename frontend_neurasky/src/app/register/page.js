'use client'

import React, { useState } from 'react';
import { RegisterPage } from '../components/RegisterPage'; // Import the "dumb" component
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Register() {
  const [error, setError] = useState('');
  const router = useRouter();

  // This is the real onRegister function
  const handleRegister = async (name, email, password) => {
    setError('');
    try {
      // 1. Call the register API
      const regResponse = await fetch('http://127.0.0.1:8000/api/register/', {
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

      if (!regResponse.ok) {
        throw new Error('Registration failed. This email may already be in use.');
      }

      // 2. If registration is OK, automatically log the user in
      toast.success("Account Created!", {
        description: "Logging you in...",
      });

      const loginResponse = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Login after register failed. Please go to the login page.');
      }

      const data = await loginResponse.json();
      localStorage.setItem('authToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      // 3. Send to profile
      router.push('/dashboard');

    } catch (err) {
      setError(err.message);
      toast.error("Registration Failed", {
        description: err.message,
      });
    }
  };

  const handleSwitchToLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <RegisterPage 
        onRegister={handleRegister} 
        onSwitchToLogin={handleSwitchToLogin} 
      />
      {error && (
        <div className="text-red-500 text-center mt-4">{error}</div>
      )}
    </>
  );
}