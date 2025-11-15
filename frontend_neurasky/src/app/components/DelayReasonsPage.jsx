'use client'

// We need to import useState and useEffect
import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Cloud, Wrench, Users, Plane, AlertTriangle, Wind, CheckCircle, Clock } from 'lucide-react'; // Added icons
import { toast } from 'sonner'; // For error notifications
import { Skeleton } from './ui/skeleton'; // For loading state

const API_URL = 'http://127.0.0.1:8000/api';

// Map statuses from your backend to icons and colors
const REASON_DETAILS = {
  'Delayed': { icon: AlertTriangle, color: '#ef4444' },
  'On-Time': { icon: CheckCircle, color: '#22c55e' },
  'Cancelled': { icon: Wrench, color: '#64748b' },
  'Diverted': { icon: Plane, color: '#eab308' },
  'Scheduled': { icon: Clock, color: '#3b82f6' },
  'Unknown': { icon: Wind, color: '#a1a1aa' }
};

// Make sure to get 'authToken' from the props
export function DelayReasonsPage({ user, onNavigate, onLogout, authToken }) {
  const [timeRange, setTimeRange] = useState('all-time');
  
  // --- NEW CODE ---
  const [isLoading, setIsLoading] = useState(true);
  const [reasonsData, setReasonsData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      
      try {
        const response = await fetch(`${API_URL}/analytics/delay-reasons/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch reasons data');
        }
        const data = await response.json();
        
        // Add icons and colors to the data from your API
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
  }, [authToken, timeRange]);
  // --- END NEW CODE ---

  // ----- MOCK DATA IS NOW GONE -----

  const totalFlights = reasonsData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="delay-reasons" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-sky-900 mb-2">Historical Status Analysis</h1>
            <p className="text-sky-700">Detailed breakdown of all recorded flight statuses</p>
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

        {/* Reason Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {isLoading ? (
            // Show Skeletons while loading
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </>
          ) : (
            reasonsData.map((reason) => {
              const Icon = reason.icon;
              const percentage = totalFlights > 0 ? ((reason.value / totalFlights) * 100).toFixed(1) : 0;
              
              return (
                <Card key={reason.name} className="border-sky-100">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${reason.color}15` }} // Faded background
                      >
                        <Icon className="w-5 h-5" style={{ color: reason.color }} />
                      </div>
                      <CardDescription>{reason.name}</CardDescription>
                    </div>
                    <CardTitle className="text-sky-900">{reason.value} Flights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-sky-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: reason.color
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Pie Chart */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="text-sky-900">Status Distribution</CardTitle>
              <CardDescription>Percentage breakdown of all recorded flights</CardDescription>
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
                      data={reasonsData} // Use live data
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reasonsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #bae6fd',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
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