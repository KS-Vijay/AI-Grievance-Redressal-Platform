
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ThreeDCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
  flipOnHover?: boolean;
  flipDuration?: number;
}

const ThreeDCard = ({
  frontContent,
  backContent,
  className = '',
  flipOnHover = false,
  flipDuration = 500,
}: ThreeDCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (!flipOnHover) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseEnter = () => {
    if (flipOnHover) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (flipOnHover) {
      setIsFlipped(false);
    }
  };

  return (
    <div
      className={cn(
        'card-3d relative cursor-pointer select-none',
        className
      )}
      onClick={handleFlip}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transitionDuration: `${flipDuration}ms`,
        }}
      >
        {/* Front Card */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {frontContent}
        </div>

        {/* Back Card */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {backContent}
        </div>
      </div>
    </div>
  );
};

export default ThreeDCard;
