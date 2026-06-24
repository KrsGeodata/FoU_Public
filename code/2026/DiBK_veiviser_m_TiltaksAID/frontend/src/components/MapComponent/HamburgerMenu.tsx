// ========================================================================== 
// HamburgerMenu Component
//
// Custom Leaflet-style hamburger button for toggling map layer controls.
// - Matches Leaflet button size, color, and border for seamless UI integration.
// - Displays children (toggle components) in a dropdown menu.
// - Shows tooltip "Velg kartlag" on hover for accessibility.
// ==========================================================================
import React, { useState } from "react";

interface HamburgerMenuProps {
  children: React.ReactNode;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="leaflet-control leaflet-bar flex items-center justify-center w-[45px] h-[45px] !border-2 !border-primary  bg-secondary cursor-pointer"
        style={{ padding: 0 }}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Åpne/lukk kartlagsmeny"
        title="Velg kartlag"
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }}>
          <rect x="5" y="8" width="18" height="3" rx="1.5" fill="#002854 " />
          <rect x="5" y="13" width="18" height="3" rx="1.5" fill="#002854 " />
          <rect x="5" y="18" width="18" height="3" rx="1.5" fill="#002854 " />
        </svg>
      </button>
      {open && (
        <div className="absolute left-full top-full mt-2 ml-2 min-w-[180px] bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 z-50">
          {children}
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
