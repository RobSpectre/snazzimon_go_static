import React from 'react';

export const CompassIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="12 2 15 12 12 22 9 12 12 2" />
  </svg>
);

export const SnazziBallIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="grad_top" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
                <stop offset="0%" style={{stopColor: 'rgb(255, 85, 85)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgb(244, 67, 54)', stopOpacity: 1}} />
            </radialGradient>
            <radialGradient id="grad_bottom" cx="50%" cy="100%" r="100%" fx="50%" fy="100%">
                <stop offset="0%" style={{stopColor: 'rgb(255, 255, 255)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgb(224, 224, 224)', stopOpacity: 1}} />
            </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#grad_bottom)" stroke="black" strokeWidth="4"/>
        <path d="M50 2C23.49 2 2 23.49 2 50H98C98 23.49 76.51 2 50 2Z" fill="url(#grad_top)"/>
        <path d="M2 50H98" stroke="black" strokeWidth="6"/>
        <circle cx="50" cy="50" r="16" fill="#f0f0f0" stroke="black" strokeWidth="6"/>
        <circle cx="50" cy="50" r="9" fill="white" stroke="#a0a0a0" strokeWidth="2"/>
        <path d="M35 15 A 35 35 0 0 1 65 15" stroke="rgba(255,255,255,0.5)" strokeWidth="5" fill="none" />
    </svg>
);


export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
  </svg>
);