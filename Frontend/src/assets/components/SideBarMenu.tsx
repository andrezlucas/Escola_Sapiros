import React, { useState } from "react";
import LogoDasboard from "../imagens/logodasboard.png";
import logout from "../utils/Logout";

interface MenuItem {
  icon: any;
  label: string;
  viewName: string;
}

interface SideBarMenuProps {
  navigateTo: (viewName: string) => void;
  menuItems: MenuItem[];
  bottomMenuItems: MenuItem[];
  activeView: string;
}

export default function SideBarMenu({
  navigateTo,
  menuItems,
  bottomMenuItems,
  activeView,
}: SideBarMenuProps) {
  const renderMenu = (items: MenuItem[]) =>
    items.map((item, index) => {
      const IconComponent = item.icon;
      const isActive = activeView === item.viewName;

      return (
        <button
          key={index}
          onClick={() => {
            if (item.viewName === "logout") {
              logout();
              return;
            }
            navigateTo(item.viewName);
          }}
          className={`relative flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 ${
            isActive ? "text-[#1D5D7F]" : "text-[#e6eef8]"
          }`}
        >
          {isActive && (
            <span className="absolute inset-0 bg-[#F4F4EE] rounded-full -z-10 animate-[fadeIn_0.2s_ease-out]" />
          )}
          <IconComponent className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[13px] md:text-[14px]">{item.label}</span>
        </button>
      );
    });

  return (
    <aside className="fixed top-0 left-0 h-screen w-52 bg-[#1D5D7F] flex flex-col p-4">
      <div className="flex justify-center items-center mb-3 mt-2">
        <img
          src={LogoDasboard}
          alt="Logo Sapiros"
          onClick={() => {
            navigateTo(menuItems[0].viewName);
          }}
          className="w-28 md:w-36 lg:w-40 h-auto object-contain cursor-pointer"
        />
      </div>

      <nav className="flex flex-col gap-3 mt-20">{renderMenu(menuItems)}</nav>
      <nav className="flex flex-col gap-4 mt-auto mb-2">
        {renderMenu(bottomMenuItems)}
      </nav>
    </aside>
  );
}
