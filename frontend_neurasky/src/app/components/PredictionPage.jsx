'use client'

import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertTriangle, CheckCircle2, Plane, X } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const FlightMapWithNoSSR = dynamic(() => import('./FlightMap'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export function PredictionPage({ user, onNavigate, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    airline: '',
    flight_number: '',
    origin: '',
    destination: '',
    date: '',
    time: ''
  });

  const handlePredict = async () => {
    if (!formData.origin || !formData.destination || !formData.airline) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/predict/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setTimeout(() => {
          setResult(data);
          setLoading(false);
          toast.success("Prediction complete!");
        }, 800);
      } else {
        toast.error(data.error || "Prediction failed.");
        setLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute top-0 w-full h-[300px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
      </div>

      <Navigation 
        user={user} 
        currentPage="predict" 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT COLUMN: INPUT FORM */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                Flight Prediction
              </h1>
              <p className="text-muted-foreground">Estimate delay probability for upcoming flights.</p>
            </div>

            <Card className="border-border bg-card shadow-xl">
              <CardHeader>
                <CardTitle>Flight Details</CardTitle>
                <CardDescription>Enter flight information to predict delays</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Origin (Airport)</Label>
                      {formData.origin && (
                        <button 
                          onClick={() => setFormData({...formData, origin: ''})}
                          className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>
                    <Select value={formData.origin} onValueChange={(val) => setFormData({...formData, origin: val})}>
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select Origin" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-border">
                        {[
                          { value: "KUL", label: "Kuala Lumpur (KUL)" },
                          { value: "PEN", label: "Penang (PEN)" },
                          { value: "BKI", label: "Kota Kinabalu (BKI)" },
                          { value: "KCH", label: "Kuching (KCH)" },
                          { value: "LGK", label: "Langkawi (LGK)" },
                          { value: "JHB", label: "Johor Bahru (JHB)" },
                          { value: "SIN", label: "Singapore (SIN)" }
                        ].map((airport) => (
                          <SelectItem 
                            key={airport.value} 
                            value={airport.value}
                            disabled={formData.destination === airport.value}
                            className={formData.destination === airport.value ? "opacity-50" : ""}
                          >
                            {airport.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Destination</Label>
                      {formData.destination && (
                        <button 
                          onClick={() => setFormData({...formData, destination: ''})}
                          className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3 h-3" /> Clear
                        </button>
                      )}
                    </div>
                    <Select value={formData.destination} onValueChange={(val) => setFormData({...formData, destination: val})}>
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select Dest" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-border">
                        {[
                          { value: "KUL", label: "Kuala Lumpur (KUL)" },
                          { value: "PEN", label: "Penang (PEN)" },
                          { value: "BKI", label: "Kota Kinabalu (BKI)" },
                          { value: "KCH", label: "Kuching (KCH)" },
                          { value: "LGK", label: "Langkawi (LGK)" },
                          { value: "JHB", label: "Johor Bahru (JHB)" },
                          { value: "SIN", label: "Singapore (SIN)" }
                        ].map((airport) => (
                          <SelectItem 
                            key={airport.value} 
                            value={airport.value}
                            disabled={formData.origin === airport.value}
                            className={formData.origin === airport.value ? "opacity-50" : ""}
                          >
                            {airport.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Scheduled Departure Time</Label>
                  <Input 
                    type="time"
                    className="bg-white border-border text-foreground"
                    onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Airline</Label>
                  <Select onValueChange={(val) => setFormData({...formData, airline: val})}>
                    <SelectTrigger className="bg-background/50 border-border">
                      <SelectValue placeholder="Select Airline" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="MH">Malaysia Airlines</SelectItem>
                      <SelectItem value="AK">AirAsia</SelectItem>
                      <SelectItem value="OD">Batik Air</SelectItem>
                      <SelectItem value="FY">Firefly</SelectItem>
                      <SelectItem value="TR">Scoot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flight-number" className="text-foreground">Flight Number (Optional)</Label>
                  <Input
                    id="flight-number"
                    placeholder="e.g. MH123"
                    value={formData.flight_number}
                    onChange={(e) => setFormData({...formData, flight_number: e.target.value})}
                    className="bg-white border-border text-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-400/20 transition-all duration-200"
                  />
                </div>
                
                <Button 
                  onClick={handlePredict} 
                  disabled={loading}
                  className="w-full bg-blue-600! hover:bg-blue-700! text-white! font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-150 h-11"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analyzing Route...
                    </div>
                  ) : (
                    "Predict Delay"
                  )}
                </Button>

              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="w-full md:w-1/2 space-y-6">
            <div>
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground/50 border-2 border-dashed border-border rounded-3xl bg-card/20">
                  <Plane className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Ready to Analyze</p>
                  <p className="text-sm">Select a route to view weather and predictions.</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* DETAILED RESULTS HEADER */}
                  <div className={`p-6 rounded-xl border ${result.estimated_delay_minutes > 15 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'} text-center shadow-sm`}>
                     <div className="flex items-center justify-center gap-3 text-2xl font-bold mb-2">
                        {result.estimated_delay_minutes > 15 ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                        {result.estimated_delay_minutes > 15 ? "DELAY PREDICTED" : "ON-TIME PREDICTED"}
                     </div>
                     <p className="text-lg font-medium opacity-90">
                        Probability: <span className="font-bold">{result.confidence}</span>
                     </p>
                  </div>

                  {/* PROBABILITY CHART */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-6">Prediction Probability</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[
                            { name: 'On-time', value: parseFloat(result.confidence_ontime) },
                            { name: 'Delayed', value: parseFloat(result.confidence_delayed) },
                          ]}
                          margin={{ top: 0, right: 30, left: 40, bottom: 5 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                          <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                          <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                            {
                              [
                                { name: 'On-time', value: parseFloat(result.confidence_ontime) },
                                { name: 'Delayed', value: parseFloat(result.confidence_delayed) },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* KEY FACTORS GRID */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Key Factors</h3>
                    <div className="grid grid-cols-2 gap-8">
                       {/* Row 1 */}
                       <div>
                          <p className="text-sm text-gray-500 mb-1">Route Delay Rate</p>
                          <p className="text-3xl font-regular text-gray-800">{result.detailed_metrics ? result.detailed_metrics.route_delay_rate : "15%"}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">↑ Historical route performance</span>
                       </div>
                       <div>
                          <p className="text-sm text-gray-500 mb-1">Airline Delay Rate</p>
                          <p className="text-3xl font-regular text-gray-800">{result.detailed_metrics ? result.detailed_metrics.airline_delay_rate : "12%"}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">↑ Airline performance</span>
                       </div>

                       {/* Row 2 */}
                       <div>
                          <p className="text-sm text-gray-500 mb-1">Departure Hour</p>
                          <p className="text-3xl font-regular text-gray-800">{result.detailed_metrics ? result.detailed_metrics.departure_hour : formData.departure_time?.split(':')[0] || "12"}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">↑ Time of day factor</span>
                       </div>
                       <div>
                          <p className="text-sm text-gray-500 mb-1">Flight Duration</p>
                          <p className="text-3xl font-regular text-gray-800">{result.detailed_metrics ? result.detailed_metrics.flight_duration_mins : "60"} min</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">↑ Scheduled duration</span>
                       </div>
                    </div>
                  </div>



                  {/* ROUTE MAP VISUALIZATION */}
                  <div className="relative h-64 w-full rounded-xl overflow-hidden border border-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] bg-black">
                    <div className="absolute inset-0 z-0">
                       <FlightMapWithNoSSR origin={formData.origin} destination={formData.destination} />
                    </div>
                    
                    {/* Overlay Info */}
                    <div className="absolute top-2 right-2 z-400 bg-black/90 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/30">
                       {formData.airline} {formData.flight_number}
                    </div>
                  </div>


                  
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
