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
    if (condition === 'Thunderstorms' || condition === 'Rain') return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (condition === 'Clear Sky') return <Sun className="w-6 h-6 text-yellow-400" />;
    return <Cloud className="w-6 h-6 text-gray-400" />;
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
                    <Label>Origin (Airport)</Label>
                    <Select onValueChange={(val) => setFormData({...formData, origin: val})}>
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select Origin" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-border">
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
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select Dest" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-border">
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
                  <Label>Flight Number (Optional)</Label>
                  <input 
                    type="text" 
                    className="flex h-10 w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                    placeholder="e.g. MH123"
                    onChange={(e) => setFormData({...formData, flight_number: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handlePredict} 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
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
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground/50 border-2 border-dashed border-border rounded-3xl bg-card/20">
                  <Plane className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Ready to Analyze</p>
                  <p className="text-sm">Select a route to view weather and predictions.</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* PREDICTION CARD */}
                  <Card className="overflow-hidden border border-border border-t-4 border-t-primary shadow-md bg-white">
                    <div className={`h-1 w-full ${result.estimated_delay_minutes > 15 ? 'bg-red-500' : 'bg-green-500'}`} />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            {result.estimated_delay_minutes > 15 ? (
                              <span className="text-red-400 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(239,68,68,0.3)]">
                                <AlertTriangle className="w-6 h-6" /> {result.prediction}
                              </span>
                            ) : (
                              <span className="text-green-400 flex items-center gap-2 drop-shadow-[0_0_5px_rgba(74,222,128,0.3)]">
                                <CheckCircle2 className="w-6 h-6" /> {result.prediction}
                              </span>
                            )}
                          </CardTitle>
                          <CardDescription className="text-base mt-1 flex items-center gap-3">
                            <span className="text-muted-foreground">Confidence: <span className="font-semibold text-primary">{result.confidence}</span></span>
                            {result.model_info && result.model_info.accuracy && (
                              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/20" title="Based on testing with 65,000 recent flights">
                                Model Accuracy: {(parseFloat(result.model_info.accuracy) * 100).toFixed(1)}%
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Est. Delay</p>
                          <p className={`text-4xl font-mono font-bold ${result.estimated_delay_minutes > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {result.estimated_delay_minutes} <span className="text-sm font-normal text-muted-foreground">min</span>
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-background/50 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Primary Factor</p>
                        <p className="text-foreground font-medium">{result.reason}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ROUTE MAP VISUALIZATION */}
                  <div className="relative h-64 w-full rounded-xl overflow-hidden border border-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] bg-black">
                    <div className="absolute inset-0 z-0">
                       <FlightMapWithNoSSR origin={formData.origin} destination={formData.destination} />
                    </div>
                    
                    {/* Overlay Info */}
                    <div className="absolute top-2 right-2 z-400 bg-black/90 px-3 py-1 rounded-full text-xs font-bold text-primary border border-primary/30">
                       {formData.airline} {formData.flight_number}
                    </div>
                  </div>

                  {/* WEATHER WIDGETS */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* ORIGIN WEATHER */}
                    <Card className="bg-linear-to-br from-blue-900/50 to-blue-900/40 border-blue-500/20 bg-card">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-secondary rounded-full shadow-sm">
                          {getWeatherIcon(result.origin_weather.condition)}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Origin</p>
                          <p className="font-bold text-foreground text-lg">{result.origin_weather.temp}</p>
                          <p className="text-xs text-muted-foreground">{result.origin_weather.condition}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* DEST WEATHER */}
                    <Card className="bg-linear-to-br from-cyan-900/50 to-cyan-900/40 border-cyan-500/20 bg-card">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-secondary rounded-full shadow-sm">
                          {getWeatherIcon(result.dest_weather.condition)}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Destination</p>
                          <p className="font-bold text-foreground text-lg">{result.dest_weather.temp}</p>
                          <p className="text-xs text-muted-foreground">{result.dest_weather.condition}</p>
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
