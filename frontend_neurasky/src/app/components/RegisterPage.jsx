'use client'

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plane } from 'lucide-react';

export function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onRegister(name, email, password);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10 bg-ios-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/10 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob animation-delay-2000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-sky-900 mb-2">NeuraSky</h1>
          <p className="text-sky-700">Flight Delay Information & Alert System</p>
        </div>

        <Card className="shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="text-xl text-center text-sky-900">Create Account</CardTitle>
            <CardDescription className="text-center">Get started with real-time flight tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder=" "
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/20">
                Create Account
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-sm text-sky-600 hover:text-sky-700 transition-colors font-medium"
                suppressHydrationWarning
              >
                Already have an account? Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
