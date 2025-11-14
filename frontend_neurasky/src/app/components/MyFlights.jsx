'use client'

import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FlightCard } from './FlightCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton'; // Import Skeleton for loading

const API_URL = 'http://127.0.0.1:8000/api';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export function MyFlights({ user, onNavigate, onLogout, authToken }) {
  const [myFlights, setMyFlights] = useState([]); // List of flights from our DB
  const [liveFlightData, setLiveFlightData] = useState({}); // Live data from AeroDataBox
  const [isLoading, setIsLoading] = useState(true); // Page loading state
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    airline: '',
    destination: '',
    origin: '',
    departureTime: '',
  });

  // --- THIS IS THE UPDATED SECTION ---
  // This useEffect fetches all data when the component loads
  useEffect(() => {
    const fetchAllFlightData = async () => {
      if (!authToken) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
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
        setMyFlights(trackedFlights); // Set the base list

        if (trackedFlights.length === 0) {
          setIsLoading(false);
          return; // No need to fetch live data if no flights are tracked
        }

        // 2. Fetch live status for each tracked flight SEQUENTIALLY
        const today = getTodayDate();
        const liveDataMap = {}; // Create an empty map to store results

        // Use a for...of loop to fetch one-by-one
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
              liveDataMap[flight.id] = liveData; // Add data to the map
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

        setLiveFlightData(liveDataMap); // Set the complete map once the loop is done

      } catch (error) {
        console.error('Error fetching flight data:', error);
        toast.error(error.message || 'Failed to load flight data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFlightData();
    
  }, [authToken]); // Only re-run all this if the user token changes (login/logout)
  // --- END OF UPDATED SECTION ---


  const handleAddFlight = async () => {
    if (!newFlight.flightNumber || !newFlight.airline || !newFlight.destination || !newFlight.origin || !newFlight.departureTime) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // --- FIX-B Start: Convert local time to UTC ---
      // Convert the local datetime string to a Date object
      const localDate = new Date(newFlight.departureTime);
      // Convert the Date object to a UTC ISO string
      const utcDepartureTime = localDate.toISOString();
      // --- FIX-B End ---

      const response = await fetch(`${API_URL}/flights/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          flight_number: newFlight.flightNumber,
          airline: newFlight.airline,
          origin: newFlight.origin,
          destination: newFlight.destination,
          departure_time: utcDepartureTime, // <-- Use the converted UTC string
        })
      });

      if (response.ok) {
        const addedFlight = await response.json();
        
        // 1. Add the new flight to our base list
        setMyFlights(currentFlights => [...currentFlights, addedFlight]);
        
        // 2. Fetch live data for *just* this new flight
        try {
          const today = getTodayDate();
          const liveRes = await fetch(`${API_URL}/flight-status/${addedFlight.flight_number}/${today}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          if (liveRes.ok) {
            const liveData = await liveRes.json();
            // 3. Add the new live data to our live data state
            setLiveFlightData(currentData => ({
              ...currentData,
              [addedFlight.id]: liveData
            }));
          }
        } catch (e) {
          console.error("Failed to fetch live data for new flight", e);
        }

        // Reset the form and close the dialog
        setNewFlight({
          flightNumber: '',
          airline: '',
          destination: '',
          origin: '',
          departureTime: '',
        });
        setDialogOpen(false);
        toast.success('Flight added successfully!');
      } else {
        toast.error('Failed to add flight. Please try again.');
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      toast.error('An error occurred.');
    }
  };

  // Helper function to merge saved data with live data for the card
  const createFlightCardProps = (trackedFlight) => {
    const live = liveFlightData[trackedFlight.id]; // Get live data by DB ID
    
    if (!live) {
      // Return just the tracked data if live data isn't loaded yet
      return {
        id: trackedFlight.id,
        flightNumber: trackedFlight.flight_number,
        airline: trackedFlight.airline,
        destination: trackedFlight.destination,
        origin: trackedFlight.origin,
        
        // [FIXED] Convert the saved datetime-local string to a Date object
        departureTime: new Date(trackedFlight.departure_time),
        arrivalTime: null, // We don't have live arrival data yet
        
        status: 'loading', // Show a loading status
      };
    }

    // Map API data to FlightCard props
    return {
      id: trackedFlight.id,
      flightNumber: trackedFlight.flight_number, // Use our saved number
      airline: live.airline.name || trackedFlight.airline,
      destination: live.arrival.airport.iata || trackedFlight.destination,
      origin: live.departure.airport.iata || trackedFlight.origin,
      
      // [FIXED] Convert both the live time and the fallback time to Date objects
      departureTime: new Date(live.departure.scheduledTimeLocal || trackedFlight.departure_time),
      // [FIXED] Add arrivalTime and convert it to a Date object
      arrivalTime: new Date(live.arrival.scheduledTimeLocal),

      gate: live.departure.gate,
      terminal: live.departure.terminal,
      // Safely format status
      status: live.status ? live.status.toLowerCase().replace(/ /g, '-') : 'unknown',
      estimatedDelay: live.departure.delayMinutes || 0,
      delayReason: null, // API doesn't provide this, but we can add later
    };
  };

  // Helper function to decide what to render
  const renderFlightCards = () => {
    if (isLoading) {
      // Show skeleton loaders while fetching
      return (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      );
    }
    
    if (myFlights.length === 0) {
      // Show empty state
      return (
        <Card className="border-sky-100">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-sky-600 mb-4">You haven&apos;t added any flights yet</p>
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Flight
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // Show flight cards
    return (
      <div className="space-y-4">
        {myFlights.map((flight) => (
          <FlightCard 
            key={flight.id} 
            flight={createFlightCardProps(flight)} // Pass the merged data
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="my-flights" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-sky-900 mb-2">My Flights</h1>
            <p className="text-sky-700">Track your upcoming flights and receive delay alerts</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow hover:from-blue-600 hover:to-cyan-600">
                <Plus className="w-4 h-4" />
                Add Flight
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Flight</DialogTitle>
                <DialogDescription>
                  Enter your flight details to track its status
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="flightNumber">Flight Number</Label>
                  <Input
                    id="flightNumber"
                    placeholder="e.g., AA1234"
                    value={newFlight.flightNumber}
                    onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })}
                    className="border-sky-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="airline">Airline</Label>
                  <Input
                    id="airline"
                    placeholder="e.g., American Airlines"
                    value={newFlight.airline}
                    onChange={(e) => setNewFlight({ ...newFlight, airline: e.target.value })}
                    className="border-sky-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      placeholder="e.g., JFK"
                      value={newFlight.origin}
                      onChange={(e) => setNewFlight({ ...newFlight, origin: e.target.value })}
                      className="border-sky-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="e.g., LAX"
                      value={newFlight.destination}
                      onChange={(e) => setNewFlight({ ...newFlight, destination: e.target.value })}
                      className="border-sky-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departureTime">Departure Time</Label>
                  <Input
                    id="departureTime"
                    type="datetime-local"
                    value={newFlight.departureTime}
                    onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.g.target.value })}
                    className="border-sky-200"
                  />
                </div>
                <Button 
                  onClick={handleAddFlight}
                  className="w-full bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Add Flight
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* This function call will render the correct state: loading, empty, or the flight list */}
        {renderFlightCards()}

      </main>
    </div>
  );
}