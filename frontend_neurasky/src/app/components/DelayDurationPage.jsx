'use client'

// We need to import useState and useEffect
import React, { useState, useEffect } from 'react'; 
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner'; // For error notifications
import { Skeleton } from './ui/skeleton'; // For loading state

const API_URL = 'http://127.0.0.1:8000/api';

// Make sure to get 'authToken' from the props, as defined in page.js
export function DelayDurationPage({ user, onNavigate, onLogout, authToken }) {
  const [timeRange, setTimeRange] = useState('all-time');
  
  // --- NEW CODE ---
  // 1. Add state for loading and chart data
  const [isLoading, setIsLoading] = useState(true);
  const [durationData, setDurationData] = useState([]);
  // --- END NEW CODE ---

  // --- NEW CODE ---
  // 2. Add useEffect to fetch data from your new API endpoint
  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/analytics/delay-durations/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch duration data');
        }
        
        const data = await response.json();
        setDurationData(data); // Set the data from your API
        
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authToken, timeRange]); // Re-fetch if auth token or time range changes
  // --- END NEW CODE ---

  // ----- MOCK DATA IS NOW GONE -----

  // Calculate stats from the *live data*
  const totalDelayedFlights = durationData.reduce((acc, item) => {
    // Don't count "On-Time" as a "delayed" flight
    if (item.range !== 'On-Time') {
      return acc + item.flights;
    }
    return acc;
  }, 0);
  
  // Find the most common range (ignoring on-time)
  const mostCommon = durationData.length > 1 
    ? durationData.filter(d => d.range !== 'On-Time').sort((a, b) => b.flights - a.flights)[0] 
    : { range: 'N/A', flights: 0 };
    
  const totalFlights = durationData.reduce((acc, item) => acc + item.flights, 0);
  const mostCommonPercent = totalFlights > 0 ? ((mostCommon.flights / totalFlights) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="delay-duration" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-sky-900 mb-2">Delay Duration Distribution</h1>
            <p className="text-sky-700">Analysis of historical flight delay patterns</p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] border-sky-200">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              {/* You can add more time ranges later if you update your API */}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Total Delayed Flights</CardDescription>
              <CardTitle className="text-sky-900">{isLoading ? <Skeleton className="h-8 w-24" /> : totalDelayedFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sky-600">
                <AlertCircle className="w-4 h-4" />
                <span>Based on historical data</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Total Flights Analyzed</CardDescription>
              <CardTitle className="text-sky-900">{isLoading ? <Skeleton className="h-8 w-24" /> : totalFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sky-600">
                <Clock className="w-4 h-4" />
                <span>All recorded flights</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Most Common Delay</CardDescription>
              <CardTitle className="text-sky-900">{isLoading ? <Skeleton className="h-8 w-32" /> : mostCommon.range}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-sky-100 text-sky-800 border-sky-200">{mostCommonPercent}% of delays</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Delay Duration Distribution Chart */}
        <Card className="border-sky-100 mb-8">
          <CardHeader>
            <CardTitle className="text-sky-900">Delay Duration Breakdown</CardTitle>
            <CardDescription>Distribution of delays across time ranges</CardDescription>
          </CardHeader>
          <CardContent>
            {/* --- NEW CODE --- */}
            {/* 3. Add loading skeleton */}
            {isLoading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
            // 4. Pass the *live data* to the chart
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={durationData}> {/* This now uses your state variable */}
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis dataKey="range" stroke="#0c4a6e" />
                <YAxis stroke="#0c4a6e" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #bae6fd',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="flights" fill="#06b6d4" name="Number of Flights" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
            {/* --- END NEW CODE --- */}
          </CardContent>
        </Card>
        
        {/* Other charts are removed for simplicity, you can add them back later */}
        
      </main>
    </div>
  );
}