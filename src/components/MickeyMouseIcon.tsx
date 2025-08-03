import React from 'react';

const MickeyMouseIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mickey Mouse head - three circles */}
      {/* Left ear */}
      <circle cx="7" cy="7" r="4" />
      {/* Right ear */}
      <circle cx="17" cy="7" r="4" />
      {/* Main head */}
      <circle cx="12" cy="14" r="6" />
    </svg>
  );
};

export default MickeyMouseIcon;