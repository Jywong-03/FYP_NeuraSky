import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { FlightCard } from './FlightCard';
import { DelayAnalytics } from './DelayAnalytics';
import { Search, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// Mock flight data
const mockFlights = [
  {
    id: '1',
    flightNumber: 'AA1234',
    airline: 'American Airlines',
    destination: 'Los Angeles (LAX)',
    origin: 'New York (JFK)',
    departureTime: '2025-10-21T14:30:00',
    arrivalTime: '2025-10-21T17:45:00',
    status: 'delayed',
    estimatedDelay: 45,
    delayReason: 'Weather conditions at departure airport',
    gate: 'B12',
    terminal: '4'
  },
  {
    id: '2',
    flightNumber: 'UA5678',
    airline: 'United Airlines',
    destination: 'Chicago (ORD)',
    origin: 'San Francisco (SFO)',
    departureTime: '2025-10-21T10:15:00',
    arrivalTime: '2025-10-21T16:30:00',
    status: 'on-time',
    estimatedDelay: 0,
    gate: 'C5',
    terminal: '3'
  },
  {
    id: '3',
    flightNumber: 'DL9012',
    airline: 'Delta Airlines',
    destination: 'Miami (MIA)',
    origin: 'Atlanta (ATL)',
    departureTime: '2025-10-21T13:00:00',
    arrivalTime: '2025-10-21T15:20:00',
    status: 'boarding',
    estimatedDelay: 0,
    gate: 'A8',
    terminal: '2'
  },
  {
    id: '4',
    flightNumber: 'SW3456',
    airline: 'Southwest Airlines',
    destination: 'Las Vegas (LAS)',
    origin: 'Denver (DEN)',
    departureTime: '2025-10-21T16:45:00',
    arrivalTime: '2025-10-21T18:10:00',
    status: 'delayed',
    estimatedDelay: 90,
    delayReason: 'Aircraft maintenance required',
    gate: 'D3',
    terminal: '1'
  },
  {
    id: '5',
    flightNumber: 'BA2345',
    airline: 'British Airways',
    destination: 'London (LHR)',
    origin: 'Boston (BOS)',
    departureTime: '2025-10-21T19:30:00',
    arrivalTime: '2025-10-22T07:15:00',
    status: 'on-time',
    estimatedDelay: 0,
    gate: 'E15',
    terminal: '5'
  },
  {
    id: '6',
    flightNumber: 'JB7890',
    airline: 'JetBlue',
    destination: 'Seattle (SEA)',
    origin: 'New York (JFK)',
    departureTime: '2025-10-21T11:20:00',
    arrivalTime: '2025-10-21T14:40:00',
    status: 'delayed',
    estimatedDelay: 30,
    delayReason: 'Air traffic congestion',
    gate: 'B7',
    terminal: '5'
  }
];

export function Dashboard({ user, onNavigate, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFlights, setFilteredFlights] = useState(mockFlights);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredFlights(mockFlights);
      return;
    }
    
    const filtered = mockFlights.filter(flight => 
      flight.flightNumber.toLowerCase().includes(query.toLowerCase()) ||
      flight.destination.toLowerCase().includes(query.toLowerCase()) ||
      flight.origin.toLowerCase().includes(query.toLowerCase()) ||
      flight.airline.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredFlights(filtered);
  };

  const delayedFlights = mockFlights.filter(f => f.status === 'delayed').length;
  const onTimeFlights = mockFlights.filter(f => f.status === 'on-time').length;
  const totalFlights = mockFlights.length;
  const avgDelay = Math.round(mockFlights.reduce((acc, f) => acc + f.estimatedDelay, 0) / mockFlights.length);

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-sky-900 mb-2">Flight Dashboard</h1>
          <p className="text-sky-700">Real-time flight status powered by AI predictions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Total Flights</CardDescription>
              <CardTitle className="text-sky-900">{totalFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-4 h-4 text-sky-500" />
            </CardContent>
          </Card>
          
          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Delayed Flights</CardDescription>
              <CardTitle className="text-red-600">{delayedFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardContent>
          </Card>
          
          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>On-Time Flights</CardDescription>
              <CardTitle className="text-green-600">{onTimeFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardContent>
          </Card>
          
          <Card className="border-sky-100">
            <CardHeader className="pb-2">
              <CardDescription>Avg Delay</CardDescription>
              <CardTitle className="text-sky-900">{avgDelay} min</CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="w-4 h-4 text-sky-500" />
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-8 border-sky-100">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-sky-400" />
              <Input
                placeholder="Search by flight number, destination, or airline..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-sky-200 focus:border-sky-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Delay Analytics */}
        <DelayAnalytics flights={mockFlights} />

        {/* Flight List */}
        <div className="mb-8">
          <h2 className="text-sky-900 mb-4">Live Flight Status</h2>
          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
