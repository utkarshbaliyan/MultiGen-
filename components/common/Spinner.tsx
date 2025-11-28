
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="relative w-24 h-24">
        <div className="absolute border-4 border-gray-800 rounded-full w-full h-full"></div>
        <div className="absolute border-4 border-t-purple-500 rounded-full w-full h-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Spinner;
