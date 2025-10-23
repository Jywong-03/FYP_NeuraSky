'use client'

import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Cloud, Wrench, Users, Plane, AlertTriangle, Wind } from 'lucide-react';

export function DelayReasonsPage({ user, onNavigate, onLogout }) {
  const [timeRange, setTimeRange] = useState('7days');

  // Delay reasons data
  const reasonsData = [
    { name: 'Weather Conditions', value: 38, icon: Cloud, color: '#3b82f6' },
    { name: 'Aircraft Maintenance', value: 22, icon: Wrench, color: '#06b6d4' },
    { name: 'Air Traffic Congestion', value: 18, icon: Plane, color: '#0ea5e9' },
    { name: 'Crew Availability', value: 12, icon: Users, color: '#0284c7' },
    { name: 'Security Issues', value: 6, icon: AlertTriangle, color: '#0c4a6e' },
    { name: 'Other Reasons', value: 4, icon: Wind, color: '#7dd3fc' },
  ];

  // Weather subcategories
  const weatherData = [
    { type: 'Thunderstorms', count: 45, severity: 'High' },
    { type: 'Heavy Rain', count: 32, severity: 'Medium' },
    { type: 'Fog', count: 28, severity: 'Medium' },
    { type: 'Snow/Ice', count: 24, severity: 'High' },
    { type: 'Strong Winds', count: 18, severity: 'Medium' },
    { type: 'Low Visibility', count: 15, severity: 'Low' },
  ];

  // Monthly reason trends
  const monthlyTrends = [
    { month: 'Apr', weather: 25, maintenance: 15, traffic: 12, crew: 8 },
    { month: 'May', weather: 32, maintenance: 18, traffic: 15, crew: 10 },
    { month: 'Jun', weather: 42, maintenance: 20, traffic: 22, crew: 12 },
    { month: 'Jul', weather: 48, maintenance: 16, traffic: 28, crew: 14 },
    { month: 'Aug', weather: 45, maintenance: 19, traffic: 25, crew: 11 },
    { month: 'Sep', weather: 38, maintenance: 22, traffic: 20, crew: 13 },
    { month: 'Oct', weather: 30, maintenance: 18, traffic: 18, crew: 9 },
  ];

  const COLORS = ['#3b82f6', '#06b6d4', '#0ea5e9', '#0284c7', '#0c4a6e', '#7dd3fc'];

  const totalDelays = reasonsData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="delay-reasons" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-sky-900 mb-2">Delay Reasons Analysis</h1>
            <p className="text-sky-700">Detailed breakdown of delay causes and patterns</p>
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

        {/* Reason Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {reasonsData.map((reason) => {
            const Icon = reason.icon;
            const percentage = ((reason.value / totalDelays) * 100).toFixed(1);
            
            return (
              <Card key={reason.name} className="border-sky-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${reason.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: reason.color }} />
                    </div>
                    <CardDescription>{reason.name}</CardDescription>
                  </div>
                  <CardTitle className="text-sky-900">{reason.value}%</CardTitle>
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
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="text-sky-900">Delay Reasons Distribution</CardTitle>
              <CardDescription>Percentage breakdown of delay causes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={reasonsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {reasonsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #bae6fd',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weather Details */}
          <Card className="border-sky-100">
            <CardHeader>
              <CardTitle className="text-sky-900">Weather-Related Delays</CardTitle>
              <CardDescription>Breakdown by weather type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weatherData.map((weather) => {
                  const severityColor = weather.severity === 'High' ? 'red' : weather.severity === 'Medium' ? 'yellow' : 'green';
                  
                  return (
                    <div key={weather.type} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Cloud className="w-5 h-5 text-sky-600" />
                        <div>
                          <p className="text-sky-900">{weather.type}</p>
                          <p className="text-sky-600">{weather.count} incidents</p>
                        </div>
                      </div>
                      <Badge 
                        className={
                          severityColor === 'red' 
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : severityColor === 'yellow'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-green-100 text-green-800 border-green-200'
                        }
                      >
                        {weather.severity}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card className="border-sky-100">
          <CardHeader>
            <CardTitle className="text-sky-900">Monthly Delay Reason Trends</CardTitle>
            <CardDescription>Tracking delay causes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyTrends}>
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
                <Bar dataKey="weather" stackId="a" fill="#3b82f6" name="Weather" />
                <Bar dataKey="maintenance" stackId="a" fill="#06b6d4" name="Maintenance" />
                <Bar dataKey="traffic" stackId="a" fill="#0ea5e9" name="Air Traffic" />
                <Bar dataKey="crew" stackId="a" fill="#0284c7" name="Crew Issues" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
