'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-label';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../utils/api';

export function AlertNotifications() {
  // --- Alerts now start as an empty array
  const [alerts, setAlerts] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  // --- This state is fine, it's for user preference
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    async function fetchInitialAlerts() {
      try {
        const initialAlerts = await api.get('/alerts/');
        setAlerts(initialAlerts || []);
      } catch (error) {
        console.error("Failed to fetch initial alerts:", error);
      }
    }
    fetchInitialAlerts();
  }, []); // Runs once on mount

  // --- This useEffect now POLLS for new alerts instead of faking them
  useEffect(() => {
    if (!alertsEnabled) return;

    const interval = setInterval(async () => {
      try {
        // --- We'll create a new endpoint just for "new" alerts
        // --- It's more efficient than fetching all alerts every time
        // --- We pass the ID of the "latest" alert we have
        const latestAlertId = alerts[0]?.id || 0;
        const newAlerts = await api.get(`/alerts/new/?since=${latestAlertId}`);
        
        if (newAlerts && newAlerts.length > 0) {
          // Add new alerts to the top of the list
          setAlerts(prev => [...newAlerts, ...prev]);
          
          // Show toast for the first new alert
          toast(newAlerts[0].title, {
            description: newAlerts[0].message,
            action: {
              label: 'View',
              onClick: () => setShowPanel(true)
            }
          });
        }
      } catch (error) {
        console.error("Failed to poll for new alerts:", error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [alertsEnabled, alerts]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAsRead = async (id) => {
    try {
      // Optimistically update the UI
      setAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      ));
      // Tell the backend
      await api.post('/alerts/mark-read/', { id: id });
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
      // --- If it fails, we could roll back the change, but this is simpler
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
      // Tell the backend
      await api.post('/alerts/mark-all-read/');
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteAlert = async (id) => {
    try {
      // Optimistically update UI
      setAlerts(prev => prev.filter(alert => alert.id !== id));
      // Tell the backend
      await api.delete('/alerts/delete/', { id: id });
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'delay':
        return <AlertTriangle className="w-5 h-5" />;
      case 'cancellation':
        return <X className="w-5 h-5" />;
      case 'gate-change':
        return <Info className="w-5 h-5" />;
      case 'boarding':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTimestamp = (dateString) => {
    // --- This function is now safer ---
    
    // 1. Check if the dateString is valid
    if (!dateString) {
      return "Just now"; // Default to "Just now" if data is missing
    }
    
    const date = new Date(dateString);

    // 2. Check if the date object is valid
    //    isNaN(date.getTime()) is the standard way to check for "Invalid Date"
    if (isNaN(date.getTime())) {
      console.error("Invalid date string received:", dateString);
      return "Invalid date";
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPanel(!showPanel)}
          className="relative text-primary hover:text-primary hover:bg-blue-100 active:bg-blue-200 active:scale-95 transition-all duration-200 rounded-full h-10 w-10"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Notification Panel */}
        {showPanel && (
          <div className="absolute top-full mt-2 right-0 w-80 z-60 animate-in fade-in slide-in-from-top-2 duration-200">
            <Card className="border-border shadow-xl bg-white! text-foreground ring-1 ring-black/5">
              <div className="p-4 border-b border-border bg-white rounded-t-lg">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <div className="bg-blue-100 p-1.5 rounded-full">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    Notifications
                  </CardTitle>
                  <div className="flex items-center gap-2">
                     {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPanel(false)}
                      className="h-7 w-7 text-muted-foreground hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all duration-200 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                  <span className="text-xs font-medium text-muted-foreground">Real-time alerts</span>
                  <Switch
                    checked={alertsEnabled}
                    onCheckedChange={setAlertsEnabled}
                    className="scale-75 data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
              <CardContent className="p-0 bg-white rounded-b-lg">
                <ScrollArea className="h-[400px]">
                  {alerts.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-20 text-primary" />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 hover:bg-muted transition-colors cursor-pointer ${
                            !alert.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => markAsRead(alert.id)}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)} shrink-0 h-fit`}>
                              {getAlertIcon(alert.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className={`text-sm font-semibold ${!alert.read ? 'text-foreground' : 'text-muted-foreground'}`}>{alert.title}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteAlert(alert.id);
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{alert.message}</p>
                              <div className="flex items-center gap-2">
                                {alert.flightNumber && (
                                  <Badge variant="outline" className="border-blue-200 text-blue-600 text-[10px] h-5 px-1.5 font-mono bg-blue-50">
                                    {alert.flightNumber}
                                  </Badge>
                                )}
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                                  <Clock className="w-3 h-3" />
                                  {formatTimestamp(alert.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>

  );
}
