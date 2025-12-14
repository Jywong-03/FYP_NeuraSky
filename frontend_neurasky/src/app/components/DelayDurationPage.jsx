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
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-background" />

      <Navigation user={user} currentPage="delay-duration" onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Corporate Hero Header */}
      <div className="bg-blue-900 text-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
               <Clock className="w-8 h-8" />
               Delay Duration Distribution
            </h1>
            <p className="text-blue-100 opacity-90">Analysis of historical flight delay patterns</p>
          </div>
          
          <div className="bg-white/10 p-1 rounded-lg backdrop-blur-sm border border-white/20">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-white focus:ring-0 focus:ring-offset-0 shadow-none">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border text-foreground">
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header content moved to Hero Banner */ }

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border border-border border-t-4 border-t-red-500 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Total Delayed Flights</CardDescription>
              <CardTitle className="text-foreground text-2xl font-mono">{isLoading ? <Skeleton className="h-8 w-24 bg-muted" /> : totalDelayedFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Based on historical data</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-border border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Total Flights Analyzed</CardDescription>
              <CardTitle className="text-foreground text-2xl font-mono">{isLoading ? <Skeleton className="h-8 w-24 bg-muted" /> : totalFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>All recorded flights</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-border border-t-4 border-t-orange-500 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Most Common Delay</CardDescription>
              <CardTitle className="text-foreground text-2xl font-mono">{isLoading ? <Skeleton className="h-8 w-32 bg-muted" /> : mostCommon.range}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="border-orange-500/20 text-orange-600 bg-orange-50">{mostCommonPercent}% of delays</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Delay Duration Distribution Chart */}
        <Card className="bg-white border border-border border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
            <CardTitle className="text-foreground">Delay Duration Breakdown</CardTitle>
            <CardDescription className="text-muted-foreground">Distribution of delays across time ranges</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                <Skeleton className="h-full w-full bg-muted" />
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="range" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend iconType="circle" />
                <Bar 
                  dataKey="flights" 
                  fill="hsl(var(--primary))" 
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