
import React from 'react';

const BackgroundPattern = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Abstract shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute top-1/4 -left-24 w-72 h-72 rounded-full bg-secondary/5 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/60"></div>
    </div>
  );
};

export default BackgroundPattern;
