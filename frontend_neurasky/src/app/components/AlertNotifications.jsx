import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AlertNotifications({ userType = 'passenger' }) {
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      type: 'delay',
      severity: 'high',
      title: 'Flight Delayed',
      message: 'AA1234 to Los Angeles delayed by 45 minutes due to weather conditions',
      flightNumber: 'AA1234',
      timestamp: new Date('2024-01-01T12:00:00Z'),
      read: false
    },
    {
      id: '2',
      type: 'gate-change',
      severity: 'medium',
      title: 'Gate Changed',
      message: 'UA5678 gate changed from C5 to C8',
      flightNumber: 'UA5678',
      timestamp: new Date('2024-01-01T11:45:00Z'),
      read: false
    },
    {
      id: '3',
      type: 'boarding',
      severity: 'medium',
      title: 'Now Boarding',
      message: 'DL9012 to Miami now boarding at Gate A8',
      flightNumber: 'DL9012',
      timestamp: new Date('2024-01-01T11:30:00Z'),
      read: true
    },
  ]);

  const [showPanel, setShowPanel] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    // Simulate real-time alerts
    if (!alertsEnabled) return;

    const interval = setInterval(() => {
      const random = Math.random();
      
      if (random > 0.7) {
        const newAlert = {
          id: Date.now().toString(),
          type: ['delay', 'gate-change', 'boarding', 'info'][Math.floor(Math.random() * 4)],
          severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          title: 'New Alert',
          message: 'Flight status updated',
          flightNumber: `AA${Math.floor(Math.random() * 9000) + 1000}`,
          timestamp: new Date(),
          read: false
        };

        setAlerts(prev => [newAlert, ...prev]);
        
        // Show toast notification
        toast(newAlert.title, {
          description: newAlert.message,
          action: {
            label: 'View',
            onClick: () => setShowPanel(true)
          }
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [alertsEnabled]);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAsRead = (id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const deleteAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
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

  const formatTimestamp = (date) => {
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
          className="relative"
        >
          <Bell className="w-5 h-5 text-sky-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed top-16 right-4 w-96 z-50 animate-in slide-in-from-top-5">
          <Card className="border-sky-100 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sky-900">Alerts & Notifications</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPanel(false)}
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
