'use client'

import React, { useState, useEffect } from 'react'; 
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';
import { api } from '../../utils/api';

export function DelayDurationPage({ user, onNavigate, onLogout }) {
  const [timeRange, setTimeRange] = useState('all-time');
  const [isLoading, setIsLoading] = useState(true);
  const [durationData, setDurationData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const data = await api.get('/analytics/delay-durations/');
        setDurationData(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const totalDelayedFlights = durationData.reduce((acc, item) => {
    if (item.range !== 'On-Time') {
      return acc + item.flights;
    }
    return acc;
  }, 0);
  
  const mostCommon = durationData.length > 1 
    ? durationData.filter(d => d.range !== 'On-Time').sort((a, b) => b.flights - a.flights)[0] 
    : { range: 'N/A', flights: 0 };

  const totalFlights = durationData.reduce((acc, item) => acc + item.flights, 0);
  const mostCommonPercent = totalDelayedFlights > 0 
    ? ((mostCommon.flights / totalDelayedFlights) * 100).toFixed(1) 
    : 0;
    
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-ios-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/10 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob animation-delay-2000" />
      </div>

      <Navigation user={user} currentPage="delay-duration" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1E293B] mb-2">Delay Duration Distribution</h1>
            <p className="text-[#64748B]">Analysis of historical flight delay patterns</p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#64748B]">Total Delayed Flights</CardDescription>
              <CardTitle className="text-[#1E293B]">{isLoading ? <Skeleton className="h-8 w-24" /> : totalDelayedFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-[#64748B] text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Based on historical data</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#64748B]">Total Flights Analyzed</CardDescription>
              <CardTitle className="text-[#1E293B]">{isLoading ? <Skeleton className="h-8 w-24" /> : totalFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-[#64748B] text-sm">
                <Clock className="w-4 h-4" />
                <span>All recorded flights</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#64748B]">Most Common Delay</CardDescription>
              <CardTitle className="text-[#1E293B]">{isLoading ? <Skeleton className="h-8 w-32" /> : mostCommon.range}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-200/50">{mostCommonPercent}% of delays</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Delay Duration Distribution Chart */}
        <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
            <CardTitle className="text-[#1E293B]">Delay Duration Breakdown</CardTitle>
            <CardDescription className="text-[#64748B]">Distribution of delays across time ranges</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis 
                  dataKey="range" 
                  stroke="#64748B" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="flights" 
                  fill="#007AFF" 
                  name="Number of Flights" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}