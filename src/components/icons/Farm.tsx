
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const Farm: React.FC<IconProps> = ({ 
  size = 24, 
  strokeWidth = 2, 
  color = "currentColor", 
  ...props 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 21V10l8-6 8 6v11" />
      <path d="M13 13h4v8h-4z" />
      <path d="M7 21v-9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v9" />
      <path d="M3 21h18" />
      <path d="M16 13v-2" />
    </svg>
  );
};

export default Farm;
