'use client'

import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Cloud, Wrench, Users, Plane, AlertTriangle, Wind, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';
import { api } from '../../utils/api';

const REASON_DETAILS = {
  'Delayed': { icon: AlertTriangle, color: '#FF3B30' },
  'On-Time': { icon: CheckCircle, color: '#34C759' },
  'Cancelled': { icon: Wrench, color: '#8E8E93' },
  'Diverted': { icon: Plane, color: '#FF9500' },
  'Scheduled': { icon: Clock, color: '#007AFF' },
  'Unknown': { icon: Wind, color: '#AF52DE' }
};

export function DelayReasonsPage({ user, onNavigate, onLogout }) {
  const [timeRange, setTimeRange] = useState('all-time');
  const [isLoading, setIsLoading] = useState(true);
  const [reasonsData, setReasonsData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const data = await api.get('/analytics/delay-reasons/');
        
        const formattedData = data.map(item => ({
          ...item,
          ...REASON_DETAILS[item.name] || REASON_DETAILS['Unknown']
        }));
        
        setReasonsData(formattedData);
        
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const totalFlights = reasonsData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-ios-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/10 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob animation-delay-2000" />
      </div>

      <Navigation user={user} currentPage="delay-reasons" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1E293B] mb-2">Historical Status Analysis</h1>
            <p className="text-[#64748B]">Detailed breakdown of all recorded flight statuses</p>
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

        {/* Reason Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
            </>
          ) : (
            reasonsData.map((reason) => {
              const Icon = reason.icon;
              const percentage = totalFlights > 0 ? ((reason.value / totalFlights) * 100).toFixed(1) : 0;
              
              return (
                <Card key={reason.name} className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="p-2.5 rounded-xl transition-colors"
                        style={{ backgroundColor: `${reason.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: reason.color }} />
                      </div>
                      <CardDescription className="text-base font-medium text-[#64748B]">{reason.name}</CardDescription>
                    </div>
                    <CardTitle className="text-2xl font-bold text-[#1E293B]">{reason.value} <span className="text-sm font-normal text-[#64748B]">Flights</span></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: reason.color
                        }}
                      />
                    </div>
                    <p className="text-right text-sm text-[#64748B] mt-2">{percentage}%</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Pie Chart */}
          <Card className="border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader>
              <CardTitle className="text-[#1E293B]">Status Distribution</CardTitle>
              <CardDescription className="text-[#64748B]">Percentage breakdown of all recorded flights</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="w-full h-[350px] flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={reasonsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {reasonsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      itemStyle={{ color: '#1F2937' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}