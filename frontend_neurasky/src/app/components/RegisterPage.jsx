'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';


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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-background">
      <div className="fixed inset-0 -z-10 bg-dotted-pattern opacity-5" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="relative inline-block">
             {/* <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" /> Removed for cleaner look */}
             <Image src="/NeuraSky.svg" alt="NeuraSky Logo" width={96} height={96} className="w-24 h-24 mb-4 mx-auto relative z-10 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          </div>
          <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">NeuraSky</h1>
          <p className="text-muted-foreground font-mono text-sm">Flight Delay Information & Alert System</p>
        </div>

        <Card className="bg-white border border-border border-t-4 border-t-primary shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground font-bold tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-center text-muted-foreground">Get started with real-time flight tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                   className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                   className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                   className="bg-white border-border text-foreground placeholder:text-muted-foreground/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-150">
                Create Account
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                suppressHydrationWarning
              >
                Already have an account? <span className="text-primary underline-offset-4 hover:underline">Sign in</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
