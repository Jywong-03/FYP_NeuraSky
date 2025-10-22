import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FlightCard } from './FlightCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function MyFlights({ user, onNavigate, onLogout }) {
  const [myFlights, setMyFlights] = useState([
    {
      id: '1',
      flightNumber: 'AA1234',
      airline: 'American Airlines',
      destination: 'Los Angeles (LAX)',
      origin: 'New York (JFK)',
      departureTime: '2025-10-25T14:30:00',
      arrivalTime: '2025-10-25T17:45:00',
      status: 'on-time',
      estimatedDelay: 0,
      gate: 'B12',
      terminal: '4'
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    airline: '',
    destination: '',
    origin: '',
    departureTime: '',
  });

  const handleAddFlight = () => {
    if (!newFlight.flightNumber || !newFlight.airline || !newFlight.destination || !newFlight.origin || !newFlight.departureTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const flight = {
      id: Date.now().toString(),
      flightNumber: newFlight.flightNumber,
      airline: newFlight.airline,
      destination: newFlight.destination,
      origin: newFlight.origin,
      departureTime: newFlight.departureTime,
      arrivalTime: new Date(new Date(newFlight.departureTime).getTime() + 3 * 60 * 60 * 1000).toISOString(),
      status: 'on-time',
      estimatedDelay: 0,
    };

    setMyFlights([...myFlights, flight]);
    setNewFlight({
      flightNumber: '',
      airline: '',
      destination: '',
      origin: '',
      departureTime: '',
    });
    setDialogOpen(false);
    toast.success('Flight added successfully!');
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
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow hover:from-blue-600 hover:to-cyan-600">
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
                    onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                    className="border-sky-200"
                  />
                </div>
                <Button 
                  onClick={handleAddFlight}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Add Flight
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {myFlights.length === 0 ? (
          <Card className="border-sky-100">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-sky-600 mb-4">You haven&apos;t added any flights yet</p>
              <Button 
                onClick={() => setDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Flight
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myFlights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
