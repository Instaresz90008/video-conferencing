import React from 'react';

const BackgroundElements: React.FC = () => {
  return (
    <>
      {/* Decorative elements */}
      <div className="absolute top-[-50%] left-[-10%] w-[70%] h-[70%] rounded-full bg-brand-purple/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] rounded-full bg-brand-blue/20 blur-3xl pointer-events-none" />
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/20 pointer-events-none" />
      
      {/* Glass reflections */}
      <div className="absolute top-[10%] left-[5%] w-[40%] h-[1px] bg-white/20 rotate-[30deg] blur-sm pointer-events-none" />
      <div className="absolute top-[15%] left-[10%] w-[30%] h-[1px] bg-white/20 rotate-[30deg] blur-sm pointer-events-none" />
    </>
  );
};

export default BackgroundElements;