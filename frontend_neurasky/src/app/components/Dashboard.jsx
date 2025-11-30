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
import { api } from '../../utils/api';

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function Dashboard({ user, onNavigate, onLogout, authToken }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for live data
  const [liveFlights, setLiveFlights] = useState([]); // This will hold the full flight data
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // This hook will fetch live data for the user's tracked flights
  useEffect(() => {
    const fetchDashboardFlights = async () => {
      setIsLoading(true);

      try {
        // 1. Fetch the user's tracked flights first
        const trackedFlights = await api.get('/flights/');

        if (trackedFlights.length === 0) {
          setLiveFlights([]);
          setFilteredFlights([]);
          setIsLoading(false);
          return;
        }

        // 2. Create an array of fetch promises for live status
        const flightPromises = trackedFlights.map(flight => {
          // Use the date from the tracked flight, or today if missing
          const date = flight.date || getTodayDate();
          return api.get(`/flight-status/${flight.flight_number}/${date}/`)
            .catch(() => null); // Return null if a fetch fails
        });

        // Wait for all fetches to complete
        const results = await Promise.all(flightPromises);
        
        const fetchedFlights = results
          .filter(data => data) // Filter out any null (failed) results
          .map((live, index) => {
            // Find the original tracked flight ID to keep keys consistent
            // Note: The order of results matches the order of trackedFlights
            const originalId = trackedFlights[index].id;

            return {
              id: originalId,
              flight_number: live.number, // Match FlightCard expectation (snake_case)
              airline: live.airline.name,
              destination: live.arrival.airport.name || live.arrival.airport.iata,
              origin: live.departure.airport.name || live.departure.airport.iata,
              
              // Pass strings to avoid serialization issues and match FlightCard expectations
              departureTime: live.departure.scheduledTimeLocal,
              arrivalTime: live.arrival.scheduledTimeLocal,
              date: live.departure.scheduledTimeLocal, // Use departure time as the date

              status: live.status ? live.status.toLowerCase().replace(/ /g, '-') : 'unknown',
              // Fix access to delay minutes: departure.delay.minutes
              estimatedDelay: live.departure?.delay?.minutes || 0,
              delayReason: null,
              gate: live.departure.gate,
              terminal: live.departure.terminal
            };
          });

        setLiveFlights(fetchedFlights);
        setFilteredFlights(fetchedFlights);
      } catch (error) {
        console.error('Error fetching dashboard flights:', error);
        toast.error('Could not load dashboard flight data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardFlights();
  }, []);

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
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-ios-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/10 rounded-full blur-3xl opacity-50 pointer-events-none animate-blob animation-delay-2000" />
      </div>

      <Navigation user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-sky-900 mb-2">Flight Information Dashboard</h1>
          <p className="text-sky-700">Real-time flight status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-2">
              <CardDescription>Total Flights</CardDescription>
              <CardTitle className="text-sky-900">{totalFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-4 h-4 text-sky-500" />
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <CardHeader className="pb-2">
              <CardDescription>Delayed Flights</CardDescription>
              <CardTitle className="text-red-600">{delayedFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <CardHeader className="pb-2">
              <CardDescription>On-Time Flights</CardDescription>
              <CardTitle className="text-green-600">{onTimeFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <CardHeader className="pb-2">
              <CardDescription>Avg Delay</CardDescription>
              <CardTitle className="text-sky-900">{avgDelay} min</CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="w-4 h-4 text-sky-500" />
            </CardContent>
          </Card>
        </div>

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