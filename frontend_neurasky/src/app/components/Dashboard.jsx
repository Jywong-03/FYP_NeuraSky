'use client'

import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { FlightCard } from './FlightCard';
import { DelayAnalytics } from './DelayAnalytics';
import { Search, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from './ui/skeleton'; // Import Skeleton for loading
import { toast } from 'sonner';

const API_URL = 'http://127.0.0.1:8000/api';

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// These are the default flights we'll show on the dashboard.
// We just need the flight number and date to fetch their status.
const defaultFlightsToTrack = [
  { id: '1', flightNumber: 'AK6145', date: getTodayDate() },
  // { id: '2', flightNumber: 'AK512', date: getTodayDate() },
  // { id: '3', flightNumber: 'MH2611', date: getTodayDate() },
  // { id: '4', flightNumber: 'CA484', date: getTodayDate() },
  // { id: '5', flightNumber: 'FM866', date: getTodayDate() },
  // { id: '6', flightNumber: 'MU5096', date: getTodayDate() },
];

export function Dashboard({ user, onNavigate, onLogout, authToken }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for live data
  const [liveFlights, setLiveFlights] = useState([]); // This will hold the full flight data
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // This hook will fetch live data for the default flights
  useEffect(() => {
  const fetchDashboardFlights = async () => {
    if (!authToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const fetchedFlightsData = []; // This will hold the full flight data

    try {
      // 1. Fetch user's tracked flights from our database
      const flightsResponse = await fetch(`${API_URL}/flights/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!flightsResponse.ok) {
        throw new Error('Failed to fetch your tracked flights');
      }

      const trackedFlights = await flightsResponse.json();

      if (trackedFlights.length === 0) {
        setIsLoading(false);
        setLiveFlights([]); // Set empty array
        setFilteredFlights([]); // Set empty array
        return; // No need to fetch live data if no flights are tracked
      }

      // 2. Fetch live status for each tracked flight SEQUENTIALLY
      const today = getTodayDate();

      for (const flight of trackedFlights) {
        try {
          const res = await fetch(`${API_URL}/flight-status/${flight.flight_number}/${today}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (res.ok) {
            const liveData = await res.json();
            // Map the live API data to our FlightCard format
            fetchedFlightsData.push({
              id: flight.id, // Use the database ID
              flightNumber: liveData.number,
              airline: liveData.airline.name,
              destination: liveData.arrival.airport.name || liveData.arrival.airport.iata,
              origin: liveData.departure.airport.name || liveData.departure.airport.iata,

              departureTime: new Date(liveData.departure.scheduledTimeLocal),
              arrivalTime: new Date(liveData.arrival.scheduledTimeLocal),

              status: liveData.status ? liveData.status.toLowerCase().replace(/ /g, '-') : 'unknown',
              estimatedDelay: liveData.departure.delayMinutes || 0,
              delayReason: null, // API doesn't provide this
              gate: liveData.departure.gate,
              terminal: liveData.departure.terminal
            });
          } else {
            console.error(`Failed to fetch live data for ${flight.flight_number}: ${res.statusText}`);
          }
        } catch (e) {
          console.error(`Error fetching ${flight.flight_number}:`, e);
        }

        // --- THIS IS THE CRITICAL FIX ---
        // Wait for 1.5 seconds (1500ms) before making the next API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        // --- END OF FIX ---
      }

      setLiveFlights(fetchedFlightsData);
      setFilteredFlights(fetchedFlightsData);

    } catch (error) {
      console.error('Error fetching dashboard flights:', error);
      toast.error(error.message || 'Could not load dashboard flight data.');
    } finally {
      setIsLoading(false);
    }
  };

  fetchDashboardFlights();
}, [authToken]); // Re-fetch if auth token changes


  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredFlights(liveFlights); // Reset to all live flights
      return;
    }
    
    const filtered = liveFlights.filter(flight => 
      flight.flightNumber.toLowerCase().includes(query.toLowerCase()) ||
      flight.destination.toLowerCase().includes(query.toLowerCase()) ||
      flight.origin.toLowerCase().includes(query.toLowerCase()) ||
      flight.airline.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredFlights(filtered);
  };

  // Calculate stats from live data
  const delayedFlights = liveFlights.filter(f => f.status === 'delayed').length;
  const onTimeFlights = liveFlights.filter(f => f.status === 'on-time').length;
  const totalFlights = liveFlights.length;
  const avgDelay = totalFlights > 0 
    ? Math.round(liveFlights.reduce((acc, f) => acc + f.estimatedDelay, 0) / totalFlights)
    : 0;

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-sky-900 mb-2">Flight Information Dashboard</h1>
          <p className="text-sky-700">Real-time flight status</p>
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

        {/* Delay Analytics - This now receives live data! */}
        <DelayAnalytics flights={liveFlights} />

        {/* Flight List */}
        <div className="mb-8">
          <h2 className="text-sky-900 mb-4">Live Flight Status</h2>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlights.length > 0 ? (
                filteredFlights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))
              ) : (
                <p className="text-sky-600 text-center py-4">No live flights could be loaded.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}