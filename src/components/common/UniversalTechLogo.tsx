import React from 'react';

interface UniversalTechLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark-only';
  showSubtitle?: boolean;
}

export const UniversalTechLogo: React.FC<UniversalTechLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = false,
}) => {
  // Dimensions based on size
  const markDimensions = {
    sm: { width: 32, height: 32, textScale: 'text-sm' },
    md: { width: 44, height: 44, textScale: 'text-base' },
    lg: { width: 64, height: 64, textScale: 'text-xl' },
    xl: { width: 96, height: 96, textScale: 'text-2xl' },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Circuit UT Circular Emblem matching supplied Universal Tech Logo */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: markDimensions.width, height: markDimensions.height }}
      >
        <svg
          viewBox="0 0 200 200"
          width={markDimensions.width}
          height={markDimensions.height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible drop-shadow-[0_4px_12px_rgba(0,191,234,0.25)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="utCyanMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00BFEA" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#071B33" />
            </linearGradient>

            <linearGradient id="utRedMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B75" />
              <stop offset="50%" stopColor="#E94B54" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>

            <linearGradient id="utCyanBevel" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            <linearGradient id="utRedBevel" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>

            {/* Glowing drop shadow filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ring Shadow */}
          <circle cx="100" cy="100" r="86" fill="#0C131D" stroke="#1E293B" strokeWidth="2" />

          {/* Left Circuit Traces & Micro-dots (Cyan) */}
          <path
            d="M 22 100 L 4 100 M 12 75 L 30 75 L 42 62 M 16 125 L 34 125 L 44 135"
            stroke="#00BFEA"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="4" cy="100" r="2.5" fill="#00BFEA" />
          <circle cx="12" cy="75" r="2" fill="#00BFEA" />
          <circle cx="16" cy="125" r="2" fill="#00BFEA" />

          {/* Right Circuit Traces & Micro-dots (Red) */}
          <path
            d="M 178 100 L 196 100 M 188 75 L 170 75 L 158 62 M 184 125 L 166 125 L 156 135"
            stroke="#E94B54"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle cx="196" cy="100" r="2.5" fill="#E94B54" />
          <circle cx="188" cy="75" r="2" fill="#E94B54" />
          <circle cx="184" cy="125" r="2" fill="#E94B54" />

          {/* Left Arc Segment of Outer Ring (Cyan/Blue metallic) */}
          <path
            d="M 100 16 A 84 84 0 0 0 46 160 L 60 148 A 66 66 0 0 1 100 34 Z"
            fill="url(#utCyanMetallic)"
            stroke="url(#utCyanBevel)"
            strokeWidth="1.5"
          />

          {/* Right Arc Segment of Outer Ring (Red/Coral metallic) */}
          <path
            d="M 112 16 A 84 84 0 0 1 184 100 A 84 84 0 0 1 96 184 L 102 166 A 66 66 0 0 0 166 100 A 66 66 0 0 0 108 34 Z"
            fill="url(#utRedMetallic)"
            stroke="url(#utRedBevel)"
            strokeWidth="1.5"
          />

          {/* Center Interlocking "U" - Left Side (Cyan) */}
          <path
            d="M 68 62 L 86 62 L 86 112 C 86 122 92 128 100 128 C 104 128 107 126 110 124 L 110 142 C 106 144 101 146 96 146 C 78 146 68 134 68 114 Z"
            fill="url(#utCyanMetallic)"
            stroke="#00BFEA"
            strokeWidth="1.5"
          />

          {/* Center Interlocking "T" - Right Side (Red) */}
          <path
            d="M 94 62 L 152 62 L 152 78 L 132 78 L 132 142 L 114 142 L 114 78 L 94 78 Z"
            fill="url(#utRedMetallic)"
            stroke="#E94B54"
            strokeWidth="1.5"
          />

          {/* High-Tech Diagonal Slicing Neon Sparks */}
          <line x1="88" y1="46" x2="114" y2="154" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
          <circle cx="101" cy="100" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="48" cy="80" r="1.5" fill="#38BDF8" />
          <circle cx="152" cy="120" r="1.5" fill="#F87171" />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant === 'full' && (
        <div className="flex flex-col">
          <div className={`font-bold tracking-tight leading-none flex items-center gap-1.5 ${markDimensions.textScale}`}>
            <span className="text-[#00BFEA] tracking-wider uppercase font-extrabold">UNIVERSAL</span>
            <span className="text-[#E94B54] tracking-wider uppercase font-extrabold">TECH</span>
          </div>
          {showSubtitle ? (
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#BCC7D3] mt-0.5">
              Client Portal · Enterprise
            </span>
          ) : (
            <span className="text-[11px] font-medium text-[#BCC7D3] mt-0.5 tracking-normal">
              INC.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
