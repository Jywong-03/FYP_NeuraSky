'use client'

import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export function HistoricalTrendsPage({ user, onNavigate, onLogout }) {
  const [timeRange, setTimeRange] = useState('12months');

  // Historical delay trends
  const monthlyData = [
    { month: 'Jan 2024', delayed: 42, onTime: 158, cancelled: 8, avgDelay: 35 },
    { month: 'Feb 2024', delayed: 38, onTime: 165, cancelled: 5, avgDelay: 32 },
    { month: 'Mar 2024', delayed: 45, onTime: 162, cancelled: 7, avgDelay: 38 },
    { month: 'Apr 2024', delayed: 52, onTime: 155, cancelled: 9, avgDelay: 42 },
    { month: 'May 2024', delayed: 48, onTime: 160, cancelled: 6, avgDelay: 40 },
    { month: 'Jun 2024', delayed: 55, onTime: 148, cancelled: 11, avgDelay: 45 },
    { month: 'Jul 2024', delayed: 62, onTime: 142, cancelled: 14, avgDelay: 48 },
    { month: 'Aug 2024', delayed: 58, onTime: 146, cancelled: 12, avgDelay: 46 },
    { month: 'Sep 2024', delayed: 50, onTime: 156, cancelled: 8, avgDelay: 41 },
    { month: 'Oct 2024', delayed: 46, onTime: 161, cancelled: 7, avgDelay: 38 },
  ];

  // Weekly trends
  const weeklyData = [
    { week: 'Week 1', delayed: 12, onTime: 38, avgDelay: 35 },
    { week: 'Week 2', delayed: 15, onTime: 35, avgDelay: 42 },
    { week: 'Week 3', delayed: 10, onTime: 40, avgDelay: 28 },
    { week: 'Week 4', delayed: 14, onTime: 36, avgDelay: 38 },
  ];

  // Seasonal patterns
  const seasonalData = [
    { season: 'Winter', avgDelay: 38, flightCount: 520, delayRate: 22 },
    { season: 'Spring', avgDelay: 42, flightCount: 580, delayRate: 25 },
    { season: 'Summer', avgDelay: 48, flightCount: 680, delayRate: 28 },
    { season: 'Fall', avgDelay: 40, flightCount: 600, delayRate: 24 },
  ];

  // Year-over-year comparison
  const yearComparison = [
    { month: 'Jan', '2023': 38, '2024': 42 },
    { month: 'Feb', '2023': 35, '2024': 38 },
    { month: 'Mar', '2023': 40, '2024': 45 },
    { month: 'Apr', '2023': 45, '2024': 52 },
    { month: 'May', '2023': 42, '2024': 48 },
    { month: 'Jun', '2023': 50, '2024': 55 },
    { month: 'Jul', '2023': 55, '2024': 62 },
    { month: 'Aug', '2023': 52, '2024': 58 },
    { month: 'Sep', '2023': 46, '2024': 50 },
    { month: 'Oct', '2023': 42, '2024': 46 },
  ];

  const currentMonthDelays = monthlyData[monthlyData.length - 1].delayed;
  const previousMonthDelays = monthlyData[monthlyData.length - 2].delayed;
  const delayChange = currentMonthDelays - previousMonthDelays;
  const delayChangePercent = ((delayChange / previousMonthDelays) * 100).toFixed(1);

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="historical-trends" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-sky-900 mb-2">Historical Delay Trends</h1>
            <p className="text-sky-700">AI-powered predictive analytics and historical patterns</p>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] border-sky-200">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="2years">Last 2 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trend Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Month-over-Month Change</CardDescription>
              <CardTitle className={delayChange > 0 ? 'text-red-600' : 'text-green-600'}>
                {delayChange > 0 ? '+' : ''}{delayChange} delays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${delayChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {delayChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{delayChangePercent}% change</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Peak Delay Season</CardDescription>
              <CardTitle className="text-sky-900">Summer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sky-600">
                <Calendar className="w-4 h-4" />
                <span>28% delay rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Predicted Next Month</CardDescription>
              <CardTitle className="text-sky-900">44 delays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingDown className="w-4 h-4" />
                <span>AI Prediction</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Trends Chart */}
        <Card className="border-sky-100 mb-8">
          <CardHeader>
            <CardTitle className="text-sky-900">Monthly Performance Trends</CardTitle>
            <CardDescription>Historical flight status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="status" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="status">Flight Status</TabsTrigger>
                <TabsTrigger value="delay">Average Delay</TabsTrigger>
              </TabsList>
              
              <TabsContent value="status">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis dataKey="month" stroke="#0c4a6e" />
                    <YAxis stroke="#0c4a6e" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #bae6fd',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="onTime" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="On-Time Flights"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="delayed" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                      name="Delayed Flights"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cancelled" 
                      stackId="1"
                      stroke="#6b7280" 
                      fill="#6b7280" 
                      fillOpacity={0.6}
                      name="Cancelled Flights"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="delay">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData}>
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Year-over-Year Comparison */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="text-sky-900">Year-over-Year Comparison</CardTitle>
              <CardDescription>Delayed flights comparison: 2023 vs 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={yearComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="month" stroke="#0c4a6e" />
                  <YAxis stroke="#0c4a6e" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #bae6fd',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="2023" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    name="2023"
                    strokeDasharray="5 5"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="2024" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    name="2024"
                    dot={{ fill: '#06b6d4', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Seasonal Patterns */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="text-sky-900">Seasonal Delay Patterns</CardTitle>
              <CardDescription>Performance metrics by season</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seasonalData.map((season) => (
                  <div key={season.season} className="p-4 bg-sky-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sky-900">{season.season}</h3>
                      <span className="text-sky-600">{season.flightCount} flights</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sky-600 mb-1">Avg Delay</p>
                        <p className="text-sky-900">{season.avgDelay} min</p>
                      </div>
                      <div>
                        <p className="text-sky-600 mb-1">Delay Rate</p>
                        <p className="text-sky-900">{season.delayRate}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-white rounded-full h-2 mt-3">
                      <div 
                        className="bg-linear-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${season.delayRate * 3}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
