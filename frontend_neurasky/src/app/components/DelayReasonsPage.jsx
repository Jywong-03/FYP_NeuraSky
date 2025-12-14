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
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-background" />

      <Navigation user={user} currentPage="delay-reasons" onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Corporate Hero Header */}
      <div className="bg-blue-900 text-white shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div>
             <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
               <AlertTriangle className="w-8 h-8" />
               Historical Status Analysis
             </h1>
             <p className="text-blue-100 opacity-90">Detailed breakdown of all flight category data</p>
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

        {/* Reason Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <Skeleton className="h-32 w-full rounded-3xl bg-muted" />
              <Skeleton className="h-32 w-full rounded-3xl bg-muted" />
              <Skeleton className="h-32 w-full rounded-3xl bg-muted" />
            </>
          ) : (
            reasonsData.map((reason) => {
              const Icon = reason.icon;
              const percentage = totalFlights > 0 ? ((reason.value / totalFlights) * 100).toFixed(1) : 0;
              
              return (
                <Card 
                  key={reason.name} 
                  className="bg-white border border-border hover:shadow-md transition-shadow shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ borderTop: `4px solid ${reason.color}` }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="p-2.5 rounded-xl transition-colors"
                        style={{ backgroundColor: `${reason.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: reason.color }} />
                      </div>
                      <CardDescription className="text-base font-medium text-foreground">{reason.name}</CardDescription>
                    </div>
                    <CardTitle className="text-2xl font-mono font-bold text-foreground">{reason.value} <span className="text-sm font-normal text-muted-foreground">Flights</span></CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: reason.color
                        }}
                      />
                    </div>
                    <p className="text-right text-sm text-muted-foreground mt-2 font-mono">{percentage}%</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Pie Chart */}
          {/* Pie Chart */}
          <Card className="bg-white border border-border border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader>
              <CardTitle className="text-foreground">Status Distribution</CardTitle>
              <CardDescription className="text-muted-foreground">Percentage breakdown of all recorded flights</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="w-full h-[350px] flex items-center justify-center">
                  <Skeleton className="h-full w-full bg-muted" />
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
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span style={{ color: 'hsl(var(--muted-foreground))' }}>{value}</span>}
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