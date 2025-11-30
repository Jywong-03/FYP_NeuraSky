'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-label';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';

export function AlertNotifications() {
  // --- Alerts now start as an empty array
  const [alerts, setAlerts] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  // --- This state is fine, it's for user preference
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // --- Helper function to get the auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // --- Helper function to make authenticated API calls
  const apiFetch = useCallback(async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Or `Token ${token}`
      ...options.headers,
    };
    
    // --- We'll use a standard base URL for our API
    const API_URL = `${API_BASE_URL}${url}`;
    
    const response = await fetch(API_URL, { ...options, headers });

    if (!response.ok) {
      // If auth fails, we could redirect to login, but for now just log it
      console.error('API fetch failed:', response.status);
      throw new Error('API request failed');
    }
    
    if (response.status === 204) { // No Content
      return null;
    }
    return response.json();
  }, []);

useEffect(() => {
    async function fetchInitialAlerts() {
      try {
        const initialAlerts = await apiFetch('/alerts/');
        setAlerts(initialAlerts || []);
      } catch (error) {
        console.error("Failed to fetch initial alerts:", error);
      }
    }
    fetchInitialAlerts();
  }, [apiFetch]); // Runs once on mount

  // --- This useEffect now POLLS for new alerts instead of faking them
  useEffect(() => {
    if (!alertsEnabled) return;

    const interval = setInterval(async () => {
      try {
        // --- We'll create a new endpoint just for "new" alerts
        // --- It's more efficient than fetching all alerts every time
        // --- We pass the ID of the "latest" alert we have
        const latestAlertId = alerts[0]?.id || 0;
        const newAlerts = await apiFetch(`/alerts/new/?since=${latestAlertId}`);
        
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
  }, [alertsEnabled, alerts, apiFetch]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAsRead = async (id) => {
    try {
      // Optimistically update the UI
      setAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      ));
      // Tell the backend
      await apiFetch(`/alerts/mark-read/`, {
        method: 'POST',
        body: JSON.stringify({ id: id })
      });
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
      await apiFetch(`/alerts/mark-all-read/`, { method: 'POST' });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteAlert = async (id) => {
    try {
      // Optimistically update UI
      setAlerts(prev => prev.filter(alert => alert.id !== id));
      // Tell the backend
      await apiFetch(`/alerts/delete/`, {
        method: 'DELETE',
        body: JSON.stringify({ id: id })
      });
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
      {/* Notification Bell Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPanel(!showPanel)}
          className="relative text-sky-700 hover:text-sky-900 hover:bg-sky-50"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed top-16 right-4 w-96 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <Card className="border-sky-100 shadow-2xl bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sky-900">Alerts & Notifications</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPanel(false)}
                  className="text-sky-700 hover:text-sky-900 hover:bg-sky-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alertsEnabled}
                    onCheckedChange={setAlertsEnabled}
                  />
                  <span className="text-sky-600">Real-time alerts</span>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-sky-600"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-sky-600">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-sky-100">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 hover:bg-sky-50 transition-colors cursor-pointer ${
                          !alert.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => markAsRead(alert.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sky-900">{alert.title}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteAlert(alert.id);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-sky-600 mb-2">{alert.message}</p>
                            <div className="flex items-center gap-2">
                              {alert.flightNumber && (
                                <Badge variant="outline" className="border-sky-300 text-sky-700">
                                  {alert.flightNumber}
                                </Badge>
                              )}
                              <span className="text-sky-500 flex items-center gap-1">
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
    </>
  );
}
