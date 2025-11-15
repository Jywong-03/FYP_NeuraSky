'use client'

// We need to import useState and useEffect
import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { toast } from 'sonner'; // For error notifications
import { Skeleton } from './ui/skeleton'; // For loading state

const API_URL = 'http://127.0.0.1:8000/api';

// Make sure to get 'authToken' from the props
export function HistoricalTrendsPage({ user, onNavigate, onLogout, authToken }) {
  const [timeRange, setTimeRange] = useState('all-time');
  
  // --- NEW CODE ---
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/analytics/historical-trends/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        const data = await response.json();
        setMonthlyData(data); // Set the data from your API
        
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authToken, timeRange]);
  // --- END NEW CODE ---

  // ----- MOCK DATA IS NOW GONE -----

  // Calculate stats from live data
  const currentMonthData = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : { avgDelay: 0 };
  const previousMonthData = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : { avgDelay: 0 };
  
  const delayChange = (currentMonthData.avgDelay - previousMonthData.avgDelay).toFixed(1);
  const delayChangePercent = previousMonthData.avgDelay > 0 
    ? ((delayChange / previousMonthData.avgDelay) * 100).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="historical-trends" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-sky-900 mb-2">Historical Delay Trends</h1>
            <p className="text-sky-700">Historical delay patterns from your collected data</p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] border-sky-200">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trend Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Month-over-Month Change</CardDescription>
              {isLoading ? <Skeleton className="h-8 w-32" /> : (
                <CardTitle className={delayChange > 0 ? 'text-red-600' : 'text-green-600'}>
                  {delayChange > 0 ? '+' : ''}{delayChange} min
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-5 w-24" /> : (
                <div className={`flex items-center gap-2 ${delayChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {delayChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{delayChangePercent}% change</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Latest Average Delay</CardDescription>
              {isLoading ? <Skeleton className="h-8 w-24" /> : (
                <CardTitle className="text-sky-900">{currentMonthData.avgDelay} min</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sky-600">
                <Calendar className="w-4 h-4" />
                <span>{currentMonthData.month}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Prediction Feature</CardDescription>
              <CardTitle className="text-sky-900">Model Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="w-4 h-4" />
                <span>Using 82.82% model</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Trends Chart */}
        <Card className="border-sky-100 mb-8">
          <CardHeader>
            <CardTitle className="text-sky-900">Monthly Average Delay</CardTitle>
            <CardDescription>Historical average delay in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}> {/* Use live data */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="month" stroke="#0c4a6e" />
                  <YAxis stroke="#0c4a6e" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #bae6fd',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgDelay" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    name="Average Delay (minutes)"
                    dot={{ fill: '#06b6d4', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Other mock data charts are removed */}
        
      </main>
    </div>
  );
}