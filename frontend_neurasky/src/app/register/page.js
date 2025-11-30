'use client'

import React, { useState } from 'react';
import { RegisterPage } from '../components/RegisterPage'; // Import the "dumb" component
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '../../utils/api';

export default function Register() {
  const [error, setError] = useState('');
  const router = useRouter();

  // This is the real onRegister function
  const handleRegister = async (name, email, password) => {
    setError('');
    try {
      // 1. Call the register API
      await api.post('/register/', {
        email: email,
        password: password,
        first_name: name,
      });

      // 2. If registration is OK, automatically log the user in
      toast.success("Account Created!", {
        description: "Logging you in...",
      });

      await api.login(email, password);

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