'use client'

import React from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import Image from 'next/image';
import { LayoutDashboard, Clock, User, Settings, LogOut, BarChart3, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { AlertNotifications } from './AlertNotifications';

export function Navigation({ user, currentPage, onNavigate, onLogout }) {
  const getButtonClass = (page) => {
    const isActive = currentPage === page;
    return isActive
      ? 'text-primary font-bold border-b-2 border-primary rounded-none h-full px-4 text-sm tracking-wide hover:bg-blue-50/50 active:bg-blue-100 active:scale-95 transition-all duration-200' // Stronger feedback
      : 'text-muted-foreground font-medium hover:text-primary hover:bg-blue-50/50 h-full px-4 text-sm tracking-wide active:bg-blue-100 active:text-primary active:scale-95 transition-all duration-200'; // Stronger feedback
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Image src="/NeuraSky.svg" alt="NeuraSky Logo" width={48} height={48} className="w-12 h-12 drop-shadow-md" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-wider">
                NEURASKY
              </span>
            </div>
            
            <div className="hidden md:flex gap-1">
              <Button
                variant="ghost"
                onClick={() => onNavigate('dashboard')}
                className={getButtonClass('dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('my-flights')}
                className={getButtonClass('my-flights')}
              >
                <Clock className="w-4 h-4 mr-2" />
                My Flights
              </Button>

              <Button
                variant="ghost"
                onClick={() => onNavigate('predict')}
                className={getButtonClass('predict')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Predict Flight
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                      ['delay-duration', 'delay-reasons', 'historical-trends'].includes(currentPage) 
                        ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white border-border text-foreground shadow-lg">
                  <DropdownMenuItem onClick={() => onNavigate('delay-duration')} className="cursor-pointer hover:bg-blue-50/50 active:bg-blue-100 active:scale-95 transition-all duration-200 focus:bg-blue-50 focus:text-primary">
                    <Clock className="w-4 h-4 mr-2" />
                    Delay Duration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('delay-reasons')} className="cursor-pointer hover:bg-blue-50/50 active:bg-blue-100 active:scale-95 transition-all duration-200 focus:bg-blue-50 focus:text-primary">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Delay Reasons
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('historical-trends')} className="cursor-pointer hover:bg-blue-50/50 active:bg-blue-100 active:scale-95 transition-all duration-200 focus:bg-blue-50 focus:text-primary">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Historical Trends
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertNotifications />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary transition-all duration-300">
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary border border-primary/50">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-border text-foreground shadow-lg">
                <div className="px-2 py-1.5">
                  <p className="text-foreground font-medium">{user.name}</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer hover:bg-blue-50/50 active:bg-blue-100 active:scale-95 transition-all duration-200 focus:bg-blue-50 focus:text-primary">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('settings')} className="cursor-pointer hover:bg-blue-50/50 active:bg-blue-100 active:scale-95 transition-all duration-200 focus:bg-blue-50 focus:text-primary">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-95 transition-all duration-200 focus:bg-red-50 focus:text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
