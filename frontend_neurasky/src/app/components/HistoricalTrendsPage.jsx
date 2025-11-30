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
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-ios-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/10 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob animation-delay-2000" />
      </div>

      <Navigation user={user} currentPage="historical-trends" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1E293B] mb-2">Historical Delay Trends</h1>
            <p className="text-[#64748B]">Historical delay patterns from your collected data</p>
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

        {/* Trend Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#64748B]">Month-over-Month Change</CardDescription>
              {isLoading ? <Skeleton className="h-8 w-32" /> : (
                <CardTitle className={`text-2xl ${delayChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {delayChange > 0 ? '+' : ''}{delayChange} min
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-5 w-24" /> : (
                <div className={`flex items-center gap-2 text-sm font-medium ${delayChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {delayChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(delayChangePercent)}% vs last month</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#64748B]">Total Recorded Delays</CardDescription>
              <CardTitle className="text-[#1E293B]">{isLoading ? <Skeleton className="h-8 w-24" /> : totalDelays}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-[#64748B] text-sm">
                <Activity className="w-4 h-4" />
                <span>Across all tracked flights</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#64748B]">Average Delay (All Time)</CardDescription>
              <CardTitle className="text-[#1E293B]">{isLoading ? <Skeleton className="h-8 w-24" /> : `${avgDelayAllTime} min`}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-[#64748B] text-sm">
                <Calendar className="w-4 h-4" />
                <span>Historical average</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Card */}
        <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <CardHeader>
             <CardTitle className="text-[#1E293B]">Delay Trends Over Time</CardTitle>
             <CardDescription className="text-[#64748B]">Historical average delay in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748B" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fill: '#64748B' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    itemStyle={{ color: '#007AFF' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgDelay" 
                    stroke="#007AFF" 
                    strokeWidth={3}
                    name="Average Delay (minutes)"
                    dot={{ fill: '#007AFF', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
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