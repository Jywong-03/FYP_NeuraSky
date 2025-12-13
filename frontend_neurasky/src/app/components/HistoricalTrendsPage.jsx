'use client'

import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';
import { api } from '../../utils/api';

export function HistoricalTrendsPage({ user, onNavigate, onLogout }) {
  const [timeRange, setTimeRange] = useState('all-time');
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const data = await api.get('/analytics/historical-trends/');
        setMonthlyData(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const currentMonthData = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : { avgDelay: 0 };
  const previousMonthData = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : { avgDelay: 0 };
  
  const delayChange = (currentMonthData.avgDelay - previousMonthData.avgDelay).toFixed(1);
  const delayChangePercent = previousMonthData.avgDelay > 0 
    ? ((delayChange / previousMonthData.avgDelay) * 100).toFixed(1) 
    : 0;

  const totalDelays = monthlyData.reduce((acc, curr) => acc + (curr.totalDelays || 0), 0);
  const avgDelayAllTime = monthlyData.length > 0 
    ? (monthlyData.reduce((acc, curr) => acc + curr.avgDelay, 0) / monthlyData.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-background" />

      <Navigation user={user} currentPage="historical-trends" onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Corporate Hero Header */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
               <Activity className="w-8 h-8" />
               Historical Delay Trends
            </h1>
            <p className="text-blue-100 opacity-90">Analyze long-term delay patterns and performance</p>
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

        {/* Trend Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border border-border border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">MoM Change</CardDescription>
              {isLoading ? <Skeleton className="h-8 w-32 bg-muted" /> : (
                <CardTitle className={`text-2xl font-mono ${delayChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {delayChange > 0 ? '+' : ''}{delayChange} min
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-5 w-24 bg-muted" /> : (
                <div className={`flex items-center gap-2 text-sm font-medium ${delayChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {delayChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(delayChangePercent)}% vs last month</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border border-border border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Total Recorded Delays</CardDescription>
              <CardTitle className="text-foreground text-2xl font-mono">{isLoading ? <Skeleton className="h-8 w-24 bg-white/10" /> : totalDelays}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Activity className="w-4 h-4 text-purple-500" />
                <span>Across all tracked flights</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-border border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Average Delay (All Time)</CardDescription>
              <CardTitle className="text-foreground text-2xl font-mono">{isLoading ? <Skeleton className="h-8 w-24 bg-white/10" /> : `${avgDelayAllTime} min`}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Historical average</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Card */}
        <Card className="bg-card border-border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
             <CardTitle className="text-foreground">Delay Trends Over Time</CardTitle>
             <CardDescription className="text-muted-foreground">Historical average delay in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="relative w-full h-[400px] flex items-center justify-center">
                <div className="absolute top-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <Skeleton className="h-full w-full bg-white/5" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))'
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgDelay" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    name="Average Delay (minutes)"
                    dot={{ fill: 'hsl(var(--background))', r: 4, strokeWidth: 2, stroke: 'hsl(var(--primary))' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}