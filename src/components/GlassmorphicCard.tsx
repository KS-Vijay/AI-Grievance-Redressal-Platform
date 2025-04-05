
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  cardEffect?: 'default' | 'hover-lift' | 'float' | 'glow';
}

const GlassmorphicCard = ({ 
  children, 
  className = '',
  cardEffect = 'default'
}: GlassmorphicCardProps) => {
  const effectClasses = {
    'default': '',
    'hover-lift': 'hover-lift',
    'float': 'animate-float',
    'glow': 'animate-pulse-glow'
  };

  return (
    <div className={cn(
      'glassmorphism rounded-xl overflow-hidden',
      effectClasses[cardEffect],
      className
    )}>
      {children}
    </div>
  );
};

export default GlassmorphicCard;
