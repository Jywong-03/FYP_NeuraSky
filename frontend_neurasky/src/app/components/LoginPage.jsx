import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plane } from 'lucide-react';

export function LoginPage({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-sky-900 mb-2">NeuraSky</h1>
          <p className="text-sky-700">AI-Powered Flight Delay Intelligence</p>
        </div>

        <Card className="border-sky-100 shadow-xl">
          <CardHeader>
            <CardTitle className="text-sky-900">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your flight dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-sky-200 focus:border-sky-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-sky-200 focus:border-sky-400"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                Sign In
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={onSwitchToRegister}
                className="text-sky-600 hover:text-sky-700 transition-colors"
              >
                Don&apos;t have an account? Sign up
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
