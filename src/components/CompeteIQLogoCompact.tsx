import React from 'react';

interface CompeteIQLogoCompactProps {
  size?: number;
  className?: string;
}

export const CompeteIQLogoCompact: React.FC<CompeteIQLogoCompactProps> = ({ 
  size = 24, 
  className = "" 
}) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified competitive intelligence symbol */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="url(#compactGradient)"
        />
        
        {/* Central analysis point */}
        <circle cx="12" cy="12" r="2" fill="white" />
        
        {/* Competitive nodes */}
        <circle cx="8" cy="8" r="1.5" fill="white" fillOpacity="0.8" />
        <circle cx="16" cy="8" r="1.5" fill="white" fillOpacity="0.8" />
        <circle cx="8" cy="16" r="1.5" fill="white" fillOpacity="0.8" />
        <circle cx="16" cy="16" r="1.5" fill="white" fillOpacity="0.8" />
        
        {/* Connection lines */}
        <path
          d="M10 12 L8 8 M14 12 L16 8 M10 12 L8 16 M14 12 L16 16"
          stroke="white"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
        
        <defs>
          <linearGradient id="compactGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};