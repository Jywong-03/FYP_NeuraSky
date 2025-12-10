'use client'

import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { CloudRain, Sun, Cloud, AlertTriangle, CheckCircle2, Plane } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';
import dynamic from 'next/dynamic';

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
        // Add a small artificial delay for "processing" feel animation
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

  const getWeatherIcon = (condition) => {
    if (condition === 'Thunderstorms' || condition === 'Rain') return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (condition === 'Clear Sky') return <Sun className="w-6 h-6 text-yellow-500" />;
    return <Cloud className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-sky-50 to-cyan-50">
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
              <h1 className="text-3xl font-bold text-sky-900 tracking-tight">Flight Prediction</h1>
              <p className="text-sky-600">Estimate delay probability for upcoming flights.</p>
            </div>

            <Card className="border-white/20 bg-white/60 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Flight Details</CardTitle>
                <CardDescription>Enter flight information to predict delays</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Origin (Airport)</Label>
                    <Select onValueChange={(val) => setFormData({...formData, origin: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Origin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KUL">Kuala Lumpur (KUL)</SelectItem>
                        <SelectItem value="PEN">Penang (PEN)</SelectItem>
                        <SelectItem value="BKI">Kota Kinabalu (BKI)</SelectItem>
                        <SelectItem value="KCH">Kuching (KCH)</SelectItem>
                        <SelectItem value="LGK">Langkawi (LGK)</SelectItem>
                        <SelectItem value="JHB">Johor Bahru (JHB)</SelectItem>
                        <SelectItem value="SIN">Singapore (SIN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Destination</Label>
                    <Select onValueChange={(val) => setFormData({...formData, destination: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Dest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KUL">Kuala Lumpur (KUL)</SelectItem>
                        <SelectItem value="PEN">Penang (PEN)</SelectItem>
                        <SelectItem value="BKI">Kota Kinabalu (BKI)</SelectItem>
                        <SelectItem value="KCH">Kuching (KCH)</SelectItem>
                        <SelectItem value="LGK">Langkawi (LGK)</SelectItem>
                        <SelectItem value="JHB">Johor Bahru (JHB)</SelectItem>
                        <SelectItem value="SIN">Singapore (SIN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Airline</Label>
                  <Select onValueChange={(val) => setFormData({...formData, airline: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Airline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MH">Malaysia Airlines</SelectItem>
                      <SelectItem value="AK">AirAsia</SelectItem>
                      <SelectItem value="OD">Batik Air</SelectItem>
                      <SelectItem value="FY">Firefly</SelectItem>
                      <SelectItem value="TR">Scoot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Flight Number (Optional)</Label>
                  <input 
                    type="text" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g. MH123"
                    onChange={(e) => setFormData({...formData, flight_number: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handlePredict} 
                  disabled={loading}
                  className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
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
            <div className="opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-sky-400/50 border-2 border-dashed border-sky-200 rounded-3xl">
                  <Plane className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Ready to Analyze</p>
                  <p className="text-sm">Select a route to view weather and predictions.</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* PREDICTION CARD */}
                  <Card className="overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-md">
                    <div className={`h-2 w-full ${result.estimated_delay_minutes > 15 ? 'bg-red-500' : 'bg-green-500'}`} />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            {result.estimated_delay_minutes > 15 ? (
                              <span className="text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" /> {result.prediction}
                              </span>
                            ) : (
                              <span className="text-green-600 flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6" /> {result.prediction}
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="text-base mt-1 flex items-center gap-3">
                            <span>Confidence: <span className="font-semibold text-sky-700">{result.confidence}</span></span>
                            {result.model_info && result.model_info.accuracy && (
                              <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded-full border border-sky-200" title="Based on testing with 65,000 recent flights">
                                Model Accuracy: {(parseFloat(result.model_info.accuracy) * 100).toFixed(1)}%
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Est. Delay</p>
                          <p className={`text-3xl font-bold ${result.estimated_delay_minutes > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {result.estimated_delay_minutes} <span className="text-sm font-normal text-gray-400">min</span>
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-sm text-slate-500 font-medium mb-1">Primary Factor</p>
                        <p className="text-slate-800 font-medium">{result.reason}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ROUTE MAP VISUALIZATION */}
                  <div className="relative h-64 w-full rounded-xl overflow-hidden border border-white/40 shadow-inner bg-slate-100">
                    <div className="absolute inset-0 z-0">
                       <FlightMapWithNoSSR origin={formData.origin} destination={formData.destination} />
                    </div>
                    
                    {/* Overlay Info */}
                    <div className="absolute top-2 right-2 z-400 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-sky-700 shadow-sm border border-white">
                       {formData.airline} {formData.flight_number}
                    </div>
                  </div>

                  {/* WEATHER WIDGETS */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* ORIGIN WEATHER */}
                    <Card className="bg-linear-to-br from-blue-400/10 to-blue-600/5 border-blue-100/50 backdrop-blur-md">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                          {getWeatherIcon(result.origin_weather.condition)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Origin</p>
                          <p className="font-bold text-slate-700">{result.origin_weather.temp}</p>
                          <p className="text-sm text-slate-500">{result.origin_weather.condition}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* DEST WEATHER */}
                    <Card className="bg-linear-to-br from-cyan-400/10 to-cyan-600/5 border-cyan-100/50 backdrop-blur-md">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                          {getWeatherIcon(result.dest_weather.condition)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Destination</p>
                          <p className="font-bold text-slate-700">{result.dest_weather.temp}</p>
                          <p className="text-sm text-slate-500">{result.dest_weather.condition}</p>
                        </div>
                      </CardContent>
                    </Card>
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
