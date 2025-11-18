import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="WASEWORM OC Logo"
  >
    <path
      d="M4 12.75C4 12.75 5.6 9.35 8 9.35C10.4 9.35 11.2 12.75 12 12.75C12.8 12.75 13.6 9.35 16 9.35C18.4 9.35 20 12.75 20 12.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 15C4 15 5.6 11.6 8 11.6C10.4 11.6 11.2 15 12 15C12.8 15 13.6 11.6 16 11.6C18.4 11.6 20 15 20 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.5"
    />
  </svg>
);
