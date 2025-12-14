'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Navigation } from './Navigation';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Activity, Clock, Map, TrendingUp, AlertTriangle, CheckCircle, Search, Calendar, Plane 
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';
import { Skeleton } from './ui/skeleton';

const AIRPORTS = [
    { code: 'KUL', name: 'Kuala Lumpur (KUL)' },
    { code: 'PEN', name: 'Penang (PEN)' },
    { code: 'BKI', name: 'Kota Kinabalu (BKI)' },
    { code: 'KCH', name: 'Kuching (KCH)' },
    { code: 'LGK', name: 'Langkawi (LGK)' },
    { code: 'JHB', name: 'Johor Bahru (JHB)' },
    { code: 'SIN', name: 'Singapore (SIN)' },
    { code: 'HKG', name: 'Hong Kong (HKG)' },
    { code: 'NRT', name: 'Tokyo Narita (NRT)' },
];

export function AnalyticsDashboard({ user, onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState('insights');
  const [isLoading, setIsLoading] = useState(true);
  
  // Historical Data States
  const [durationData, setDurationData] = useState([]);
  const [reasonsData, setReasonsData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);

  // Prediction States
  const [origin, setOrigin] = useState('KUL');
  const [destination, setDestination] = useState('PEN');
  const [isPredicting, setIsPredicting] = useState(false);
  const [forecastData, setForecastData] = useState(null);

  // Fetch Historical Data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      try {
        const results = await Promise.allSettled([
          api.get('/analytics/delay-durations/'),
          api.get('/analytics/delay-reasons/'),
          api.get('/analytics/historical-trends/')
        ]);

        // Process results safely
        if (results[0].status === 'fulfilled') setDurationData(results[0].value);
        if (results[1].status === 'fulfilled') setReasonsData(results[1].value);
        if (results[2].status === 'fulfilled') setTrendsData(results[2].value);
        
        // Log errors if any
        results.forEach((res, index) => {
            if (res.status === 'rejected') {
                console.error(`Analytics endpoint ${index} failed:`, res.reason);
            }
        });

      } catch (error) {
        toast.error("Failed to load analytics: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistoricalData();
  }, []);

  const handlePredictRoute = async () => {
    if (!origin || !destination) {
      toast.error("Please select both origin and destination");
      return;
    }
    
    setIsPredicting(true);
    try {
        const response = await api.post('/analytics/route-forecast/', {
            origin,
            destination
        });
        setForecastData(response.forecast);
        toast.success("Route analysis complete");
    } catch (error) {
        toast.error("Prediction failed: " + error.message);
    } finally {
        setIsPredicting(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation user={user} currentPage="analytics" onNavigate={onNavigate} onLogout={onLogout} />

      {/* Hero Header */}
      <div className="bg-blue-900 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-400" />
            Flight Analytics Center
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl opacity-90">
            Comprehensive insights into your flight history and AI-powered route forecasting using advanced machine learning models.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-gray-100 border p-1 rounded-xl shadow-xs w-full sm:w-fit flex">
            <TabsTrigger 
              value="insights" 
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg transition-all font-medium flex items-center justify-center ${activeTab === 'insights' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'}`}
            >
              <Clock className="w-4 h-4 mr-2" />
              My Historical Insights
            </TabsTrigger>
            <TabsTrigger 
              value="route-intel" 
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg transition-all font-medium flex items-center justify-center ${activeTab === 'route-intel' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'}`}
            >
              <Map className="w-4 h-4 mr-2" />
              Route Intelligence (AI)
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: HISTORICAL INSIGHTS */}
          <TabsContent value="insights" className="space-y-6">
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Skeleton className="h-[400px] w-full rounded-xl" />
                 <Skeleton className="h-[400px] w-full rounded-xl" />
               </div>
            ) : (
              <>
                {/* Summary Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
                      <CardHeader className="pb-2">
                        <CardDescription>Total Flights Analyzed</CardDescription>
                        <CardTitle className="text-3xl font-mono">
                          {durationData.reduce((acc, i) => acc + i.flights, 0)}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="bg-white hover:shadow-lg transition-shadow border-t-4 border-t-green-500">
                       <CardHeader className="pb-2">
                        <CardDescription>Average Delay</CardDescription>
                         <CardTitle className="text-3xl font-mono">
                           {trendsData.length > 0 ? trendsData[trendsData.length-1].avgDelay : 0} <span className="text-lg text-muted-foreground">min</span>
                         </CardTitle>
                       </CardHeader>
                    </Card>
                    <Card className="bg-white hover:shadow-lg transition-shadow border-t-4 border-t-purple-500">
                       <CardHeader className="pb-2">
                        <CardDescription>Most Frequent Status</CardDescription>
                         <CardTitle className="text-2xl font-mono truncate">
                           {reasonsData.length > 0 ? reasonsData[0].name : 'N/A'}
                         </CardTitle>
                       </CardHeader>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1: Delay Duration */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Delay Duration Distribution</CardTitle>
                      <CardDescription>How long are delays typically?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={durationData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="range" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="flights" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Chart 2: Status Breakdown */}
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Flight Status Breakdown</CardTitle>
                      <CardDescription>Proportion of On-Time vs Delayed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie 
                            data={reasonsData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={100} 
                            innerRadius={60}
                            paddingAngle={5}
                          >
                            {reasonsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart 3: Historical Trend */}
                <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Historical Delay Trend</CardTitle>
                      <CardDescription>Average delay minutes over past months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendsData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="avgDelay" stroke="#8884d8" strokeWidth={3} dot={{r: 6}} activeDot={{r: 8}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* TAB 2: ROUTE INTELLIGENCE */}
          <TabsContent value="route-intel" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Control Panel */}
                <Card className="bg-white md:col-span-1 border-t-4 border-t-indigo-500 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-indigo-500" />
                            Route Selector
                        </CardTitle>
                        <CardDescription>Analyze forecasted delays for any route</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Origin Airport</label>
                            <Select value={origin} onValueChange={setOrigin}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white">
                                    {AIRPORTS.map(a => <SelectItem key={a.code} value={a.code} disabled={a.code === destination}>{a.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Destination Airport</label>
                             <Select value={destination} onValueChange={setDestination}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white">
                                    {AIRPORTS.map(a => <SelectItem key={a.code} value={a.code} disabled={a.code === origin}>{a.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4" 
                            onClick={handlePredictRoute}
                            disabled={isPredicting}
                        >
                            {isPredicting ? (
                                <><Activity className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                            ) : (
                                <><TrendingUp className="w-4 h-4 mr-2" /> Analyze Forecast</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results Panel */}
                <div className="md:col-span-2 space-y-6">
                    {forecastData ? (
                        <>
                            <Card className="bg-white border-l-4 border-l-indigo-500 shadow-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">24-Hour Delay Forecast</CardTitle>
                                            <CardDescription>{origin} to {destination} • Next 24 Hours</CardDescription>
                                        </div>
                                        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">
                                            LIVE AI MODEL
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={forecastData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                                                <XAxis 
                                                    dataKey="display_time" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    interval={2} 
                                                    fontSize={12} 
                                                    tick={{fill: '#6b7280'}}
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    fontSize={12} 
                                                    tickFormatter={(val) => `${val}%`} 
                                                    domain={[0, 100]}
                                                    tick={{fill: '#6b7280'}}
                                                />
                                                <Tooltip 
                                                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                                    formatter={(val) => [`${val}%`, 'Delay Probability']}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="probability" 
                                                    stroke="#4f46e5" 
                                                    strokeWidth={3} 
                                                    dot={{r: 4, strokeWidth: 2, fill: 'white'}}
                                                    activeDot={{r: 6, strokeWidth: 0, fill: '#4f46e5'}}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span>Low Risk (&lt;30%)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span>Medium Risk (30-60%)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span>High Risk (&gt;60%)</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Key Insights based on forecast */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="bg-green-50/50 border-green-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base text-green-700 font-bold flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Best Time to Fly
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-green-800">
                                            Based on current conditions, the lowest delay probability is at <strong>
                                                {forecastData.reduce((prev, curr) => prev.probability < curr.probability ? prev : curr).display_time}
                                            </strong>.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-red-50/50 border-red-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base text-red-700 font-bold flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            High Risk Hours
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-red-800">
                                            Avoid flying around <strong>
                                                {forecastData.reduce((prev, curr) => prev.probability > curr.probability ? prev : curr).display_time}
                                            </strong> where delay probability peaks.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-card/50">
                            <Plane className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium">Select a route to view delay forecasts</p>
                            <p className="text-sm opacity-70">AI model will analyze next 24h of flights</p>
                        </div>
                    )}
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
