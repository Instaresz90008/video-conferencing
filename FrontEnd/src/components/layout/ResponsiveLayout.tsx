
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      // Core responsive container
      "w-full min-h-screen",
      // Min width for 11-inch iPad (834px) with some padding
      "min-w-[880px]",
      // Max width for 22-inch monitors (approximately 1920px for 16:9, but we'll use container max)
      "max-w-[2200px] mx-auto",
      // Responsive padding
      "px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16",
      // Grid system for auto layout
      "grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 xl:gap-8",
      className
    )}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;
