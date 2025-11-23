'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './Navigation';
import { FlightCard } from './FlightCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

// API_URL moved *outside* the component to prevent loops
const API_URL = 'http://127.0.0.1:8000/api';

export function MyFlights({ user, onNavigate, onLogout }) {
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for the "Add Flight" form
  const [flightNumber, setFlightNumber] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/flights/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }
      const data = await response.json();
      setFlights(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const handleAddFlight = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null); // Clear previous errors
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/flights/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          flight_number: flightNumber,
          date: flightDate
        })
      });
      
      // --- THIS IS THE NEW, SMARTER ERROR HANDLING ---
      if (!response.ok) {
        let errorMessage = 'Failed to add flight. Please check the flight number and date.';
        try {
          const errorData = await response.json();
          
          // Find the specific error message from Django
          if (errorData.detail) {
            errorMessage = errorData.detail; // e.g., "Not found."
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors[0]; // e.g., "Flight not found..."
          } else if (Array.isArray(errorData) && errorData.length > 0) {
            errorMessage = errorData[0]; // e.g., ["Flight not found..."]
          } else if (typeof errorData === 'object' && errorData !== null) {
            const firstKey = Object.keys(errorData)[0];
            errorMessage = `${firstKey}: ${errorData[firstKey][0]}`;
          }
        } catch (jsonError) {
          // If the response isn't JSON, just use the status
          errorMessage = `Error: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Re-fetch the list from the server
      await fetchFlights(); 
      
      setFlightNumber('');
      setFlightDate('');
      toast.success('Flight added and is now being tracked!');

    } catch (err) {
      // Now, the toast will show the *specific* error
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteFlight = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/flights/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete flight');
      }

      toast.success('Flight removed');
      await fetchFlights();

    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation user={user} currentPage="my-flights" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-sky-900 mb-2">My Flights</h1>
          <p className="text-sky-700">Track and manage your upcoming flights</p>
        </div>

        {/* Add Flight Form */}
        <Card className="mb-8 border-sky-100">
          <CardHeader>
            <CardTitle className="text-sky-900">Track a New Flight</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFlight} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flight-number">Flight Number</Label>
                <Input
                  id="flight-number"
                  placeholder="e.g., AA123"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flight-date">Date</Label>
                <Input
                  id="flight-date"
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="md:self-end" disabled={isAdding}>
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Flight'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Display Flights List */}
        <div className="space-y-4">
          {isLoading && (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          )}

          {!isLoading && error && (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <p className="text-center text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && flights.length === 0 && (
            <Card className="border-sky-100">
              <CardContent className="pt-6">
                <p className="text-center text-sky-700">You are not tracking any flights.</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && flights.length > 0 && (
            flights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onDelete={() => handleDeleteFlight(flight.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}