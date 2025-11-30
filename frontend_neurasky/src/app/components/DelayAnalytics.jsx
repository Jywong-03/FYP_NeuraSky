'use client'

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock flight data
export function DelayAnalytics({ flights }) {
// Analyze flight statuses (replaces delayReasons)
const statusCounts = flights.reduce((acc, flight) => {
  // Use the 'status' field from the prop
  const status = flight.status ? flight.status.replace('-', ' ') : 'unknown';

  // Capitalize the first letter for display
  const cleanStatus = status.charAt(0).toUpperCase() + status.slice(1);

  if (!acc[cleanStatus]) {
    acc[cleanStatus] = 0;
  }
  acc[cleanStatus]++;
  return acc;
}, {});

const reasonData = Object.entries(statusCounts).map(([name, value]) => ({
  name,
  value
}));

// Delay duration distribution
const delayDurations = [
  { range: 'On-Time', count: 0 }, // We'll show on-time flights as their own category
  { range: '1-30 min', count: 0 },
  { range: '30-60 min', count: 0 },
  { range: '60+ min', count: 0 },
];

flights.forEach(flight => {
  const delay = flight.estimatedDelay || 0;

  if (delay <= 0) {
    delayDurations[0].count++; // On-Time
  } else if (delay <= 30) {
    delayDurations[1].count++;
  } else if (delay <= 60) {
    delayDurations[2].count++;
  } else {
    delayDurations[3].count++;
  }
});

  const COLORS = ['#3b82f6', '#06b6d4', '#0ea5e9', '#0284c7'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="border-sky-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader>
          <CardTitle className="text-sky-900">Delay Duration Distribution</CardTitle>
          <CardDescription>Breakdown of delays by time ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={delayDurations}>
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
              <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-sky-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <CardHeader>
          <CardTitle className="text-sky-900">Flight Status Breakdown</CardTitle>
          <CardDescription>Live status of your tracked flights</CardDescription>
        </CardHeader>
        <CardContent>
          {reasonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reasonData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reasonData.map((entry, index) => (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sky-600">
              No delay data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
