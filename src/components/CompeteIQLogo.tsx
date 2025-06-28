import React from 'react';

interface CompeteIQLogoProps {
  size?: number;
  className?: string;
}

export const CompeteIQLogo: React.FC<CompeteIQLogoProps> = ({ 
  size = 40, 
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
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Background Circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="url(#gradient1)"
          className="animate-pulse-glow"
        />
        
        {/* Central Hub */}
        <circle
          cx="20"
          cy="20"
          r="3"
          fill="white"
          className="drop-shadow-sm"
        />
        
        {/* Competitive Nodes */}
        <circle cx="12" cy="12" r="2.5" fill="url(#gradient2)" />
        <circle cx="28" cy="12" r="2.5" fill="url(#gradient2)" />
        <circle cx="12" cy="28" r="2.5" fill="url(#gradient2)" />
        <circle cx="28" cy="28" r="2.5" fill="url(#gradient2)" />
        
        {/* Intelligence Connections */}
        <path
          d="M20 17 L12 12 M20 17 L28 12 M20 23 L12 28 M20 23 L28 28"
          stroke="white"
          strokeWidth="1.5"
          strokeOpacity="0.8"
          className="animate-pulse"
        />
        
        {/* Data Flow Lines */}
        <path
          d="M15 20 Q20 15 25 20 Q20 25 15 20"
          stroke="url(#gradient3)"
          strokeWidth="1"
          fill="none"
          strokeOpacity="0.6"
        />
        
        {/* Analysis Indicators */}
        <rect x="18" y="8" width="4" height="2" rx="1" fill="white" fillOpacity="0.7" />
        <rect x="18" y="30" width="4" height="2" rx="1" fill="white" fillOpacity="0.7" />
        <rect x="8" y="18" width="2" height="4" rx="1" fill="white" fillOpacity="0.7" />
        <rect x="30" y="18" width="2" height="4" rx="1" fill="white" fillOpacity="0.7" />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};