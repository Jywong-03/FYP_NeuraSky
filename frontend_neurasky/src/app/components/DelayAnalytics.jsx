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

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#a855f7']; // Mutiara Blue, Growth Green, Indigo, Purple

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="bg-white border border-border border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-foreground">Delay Duration Distribution</CardTitle>
          <CardDescription className="text-muted-foreground">Breakdown of delays by time ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={delayDurations}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" tick={{fill: 'hsl(var(--muted-foreground))'}} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{fill: 'hsl(var(--muted-foreground))'}} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white border border-border border-t-4 border-t-green-500 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-foreground">Flight Status Breakdown</CardTitle>
          <CardDescription className="text-muted-foreground">Live status of your tracked flights</CardDescription>
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
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={5}
                >
                  {reasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
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
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-card/20 rounded-lg border border-border">
              No delay data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
