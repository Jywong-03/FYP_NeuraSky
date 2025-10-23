'use client'

import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';

export function DelayDurationPage({ user, onNavigate, onLogout }) {
  const [timeRange, setTimeRange] = useState('7days');

  // Mock data for delay duration distribution
  const durationData = [
    { range: '0-15 min', flights: 45, percentage: 28 },
    { range: '15-30 min', flights: 38, percentage: 24 },
    { range: '30-60 min', flights: 42, percentage: 26 },
    { range: '60-90 min', flights: 22, percentage: 14 },
    { range: '90-120 min', flights: 8, percentage: 5 },
    { range: '120+ min', flights: 5, percentage: 3 },
  ];

  // Hourly delay distribution
  const hourlyData = [
    { hour: '00:00', avgDelay: 12 },
    { hour: '03:00', avgDelay: 8 },
    { hour: '06:00', avgDelay: 22 },
    { hour: '09:00', avgDelay: 35 },
    { hour: '12:00', avgDelay: 42 },
    { hour: '15:00', avgDelay: 48 },
    { hour: '18:00', avgDelay: 55 },
    { hour: '21:00', avgDelay: 38 },
  ];

  // Airlines comparison
  const airlineData = [
    { airline: 'American', avgDelay: 35, onTime: 72 },
    { airline: 'United', avgDelay: 42, onTime: 68 },
    { airline: 'Delta', avgDelay: 28, onTime: 78 },
    { airline: 'Southwest', avgDelay: 31, onTime: 75 },
    { airline: 'JetBlue', avgDelay: 38, onTime: 70 },
  ];

  const totalDelayedFlights = durationData.reduce((acc, item) => acc + item.flights, 0);
  const avgDelayDuration = 38; // minutes

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="delay-duration" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-sky-900 mb-2">Delay Duration Distribution</h1>
            <p className="text-sky-700">Comprehensive analysis of flight delay patterns</p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] border-sky-200">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Total Delayed Flights</CardDescription>
              <CardTitle className="text-sky-900">{totalDelayedFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>+12% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Average Delay Duration</CardDescription>
              <CardTitle className="text-sky-900">{avgDelayDuration} min</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sky-600">
                <Clock className="w-4 h-4" />
                <span>-5 min from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Most Common Range</CardDescription>
              <CardTitle className="text-sky-900">30-60 min</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-sky-100 text-sky-800 border-sky-200">26% of delays</Badge>
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
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={durationData}>
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
          </CardContent>
        </Card>

        {/* Hourly Delay Pattern */}
        <Card className="border-sky-100 mb-8">
          <CardHeader>
            <CardTitle className="text-sky-900">Hourly Delay Pattern</CardTitle>
            <CardDescription>Average delay duration by time of day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis dataKey="hour" stroke="#0c4a6e" />
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
                  name="Avg Delay (min)"
                  dot={{ fill: '#06b6d4', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Airlines Comparison */}
        <Card className="border-sky-100">
          <CardHeader>
            <CardTitle className="text-sky-900">Airline Performance Comparison</CardTitle>
            <CardDescription>Average delay and on-time performance by airline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {airlineData.map((airline) => (
                <div key={airline.airline} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-900">{airline.airline} Airlines</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sky-600">Avg Delay: <span className="text-sky-900">{airline.avgDelay} min</span></span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {airline.onTime}% On-Time
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-sky-100 rounded-full h-3">
                    <div 
                      className="bg-linear-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                      style={{ width: `${airline.onTime}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
