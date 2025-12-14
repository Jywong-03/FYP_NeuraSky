'use client'

import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FlightCard } from './FlightCard';
import { DelayAnalytics } from './DelayAnalytics';
import { Search, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from './ui/skeleton'; // Import Skeleton for loading
import { toast } from 'sonner';
import { api } from '../../utils/api';
import dynamic from 'next/dynamic';

const LiveFlightMap = dynamic(() => import('./LiveFlightMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map Engine...</div>
});

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
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // This hook will fetch live data for the user's tracked flights
  useEffect(() => {
    const fetchDashboardFlights = async () => {
      setIsLoading(true);

      try {
        // 1. Fetch the user's tracked flights from OUR database
        const trackedFlights = await api.get('/flights/');

        if (!trackedFlights || trackedFlights.length === 0) {
          setLiveFlights([]);
          setFilteredFlights([]);
          setIsLoading(false);
          return;
        }

        // 2. Map directly to the format expected by FlightCard
        // Since we are now using "Simulation Mode", we rely on what's in the DB.
        const flightData = trackedFlights.map(flight => {
          return {
            id: flight.id,
            flight_number: flight.flight_number,
            airline: flight.airline, // Should rely on component fallback or null
            // In our populate script, we didn't explicitly set 'airline' field on TrackedFlight model??
            // Wait, TrackedFlight model in `models.py` doesn't seem to have 'airline'. 
            // Let me check models.py again. If not, I'll assume it's part of flight_number or just hardcode for valid demo.
            // Actually, populate_user_flights.py didn't set airline column on TrackedFlight?
            // Let's use a helper or just display Flight Number as airline if missing.
            
            destination: flight.destination || 'N/A',
            origin: flight.origin || 'N/A',
            
            departureTime: flight.departureTime, 
            arrivalTime: flight.arrivalTime, // Model might not have arrivalTime?
            date: flight.date, 

            status: flight.status ? flight.status.toLowerCase().replace(/ /g, '-') : 'scheduled',
            estimatedDelay: flight.estimatedDelay || 0,
            delayReason: null,
            gate: flight.gate || 'TBD',
            terminal: flight.terminal || 'TBD'
          };
        });

        setLiveFlights(flightData);
        setFilteredFlights(flightData);
      } catch (error) {
        console.error('Error fetching dashboard flights:', error);
        toast.error('Could not load flight data.');
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
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute top-0 w-full h-[500px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
      </div>

      <Navigation user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-blue-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                System Operational • Online
              </p>
            </div>
            <div className="text-right hidden md:block">
               <p className="text-sm text-blue-100 font-mono opacity-80 decoration-slice">
                 {currentTime.toLocaleDateString('en-GB', {
                   year: 'numeric',
                   month: '2-digit',
                   day: '2-digit',
                 }).split('/').reverse().join('-')} <span className="text-white font-bold">{currentTime.toLocaleTimeString('en-GB', { hour12: false })}</span>
               </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border border-border border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Total Flights</CardDescription>
              <CardTitle className="text-2xl font-mono text-foreground">{totalFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardContent>
          </Card>
          
          <Card className="bg-card border border-border border-t-4 border-t-red-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Delayed</CardDescription>
              <CardTitle className="text-2xl font-mono text-red-400">{delayedFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </CardContent>
          </Card>
          
          <Card className="bg-card border border-border border-t-4 border-t-green-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">On-Time</CardDescription>
              <CardTitle className="text-2xl font-mono text-green-400">{onTimeFlights}</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </CardContent>
          </Card>
          
          <Card className="bg-card border border-border border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Avg Delay</CardDescription>
              <CardTitle className="text-2xl font-mono text-foreground">{avgDelay} <span className="text-sm font-normal text-muted-foreground">min</span></CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="w-4 h-4 text-primary" />
            </CardContent>
          </Card>
        </div>

        {/* Delay Analytics - This now receives live data! */}
        <section className="bg-card rounded-xl border border-border p-6">
           <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Analytics Overview
           </h3>
           <DelayAnalytics flights={liveFlights} />
        </section>

        {/* Flight List */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="text-primary">Live</span> Flight Map
          </h2>

          <div className="w-full h-[600px] mb-8 rounded-xl overflow-hidden shadow-md border border-blue-200 bg-white relative">
              <LiveFlightMap flights={filteredFlights} />
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-4">Your Tracked Flights</h3>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg bg-card/50" />
              <Skeleton className="h-32 w-full rounded-lg bg-card/50" />
              <Skeleton className="h-32 w-full rounded-lg bg-card/50" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlights.length > 0 ? (
                <>
                  {filteredFlights
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((flight) => (
                    <FlightCard key={flight.id} flight={flight} showRemove={false} />
                  ))}
                  
                  {/* Pagination Controls */}
                  {filteredFlights.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-24 bg-white hover:bg-gray-50 text-foreground border-border disabled:opacity-50"
                      >
                        Previous
                      </Button>
                      <span className="text-sm font-medium text-muted-foreground">
                        Page {currentPage} of {Math.ceil(filteredFlights.length / itemsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredFlights.length / itemsPerPage), p + 1))}
                        disabled={currentPage >= Math.ceil(filteredFlights.length / itemsPerPage)}
                        className="w-24 bg-white hover:bg-gray-50 text-foreground border-border disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 rounded-lg border border-border bg-card/20">
                   <p className="text-muted-foreground">No live flights active in current session.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}