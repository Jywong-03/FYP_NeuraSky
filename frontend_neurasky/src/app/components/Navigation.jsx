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
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Image src="/NeuraSky.svg" alt="NeuraSky Logo" width={48} height={48} className="w-12 h-12" />
              <span className="text-sky-900">NeuraSky</span>
            </div>
            
            <div className="hidden md:flex gap-1">
              <Button
                variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => onNavigate('dashboard')}
                className={currentPage === 'dashboard' ? 'bg-linear-to-r from-blue-500 to-cyan-500 text-white' : 'text-sky-700 hover:text-sky-900 hover:bg-sky-50'}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentPage === 'my-flights' ? 'default' : 'ghost'}
                onClick={() => onNavigate('my-flights')}
                className={currentPage === 'my-flights' ? 'bg-linear-to-r from-blue-500 to-cyan-500 text-white' : 'text-sky-700 hover:text-sky-900 hover:bg-sky-50'}
              >
                <Clock className="w-4 h-4 mr-2" />
                My Flights
              </Button>

              <Button
                variant={currentPage === 'predict' ? 'default' : 'ghost'}
                onClick={() => onNavigate('predict')}
                className={currentPage === 'predict' ? 'bg-linear-to-r from-blue-500 to-cyan-500 text-white' : 'text-sky-700 hover:text-sky-900 hover:bg-sky-50'}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Predict Flight
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                      ['delay-duration', 'delay-reasons', 'historical-trends'].includes(currentPage) 
                        ? 'bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow hover:from-blue-600 hover:to-cyan-600' 
                        : 'text-sky-700 hover:text-sky-900 hover:bg-sky-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onNavigate('delay-duration')} className="cursor-pointer">
                    <Clock className="w-4 h-4 mr-2" />
                    Delay Duration
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('delay-reasons')} className="cursor-pointer">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Delay Reasons
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('historical-trends')} className="cursor-pointer">
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
                <button className="relative h-10 w-10 rounded-full hover:opacity-80 transition-opacity">
                  <Avatar>
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-cyan-500 text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sky-900">{user.name}</p>
                  <p className="text-sky-600">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('profile')} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('settings')} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
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
