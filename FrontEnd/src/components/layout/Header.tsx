
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Video, Home, MessageCircle, Users, Settings, Mail, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Meeting Dashboard', icon: Video },
    { path: '/chat', label: 'Chat Center', icon: MessageCircle },
    { path: '/email', label: 'Email', icon: Mail },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/participants', label: 'Participants', icon: Users },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 dark:bg-black/20 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Video className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold">VideoMeet</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2",
                      isActive && "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Users className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
