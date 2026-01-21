import React, { useState } from "react";
import LogoDasboard from "../imagens/logodasboard.png";
import logout from "../utils/Logout";
import { HiMenuAlt3, HiX } from "react-icons/hi";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            setMobileMenuOpen(false);
          }}
          className={`
            relative
            flex items-center gap-2
            px-3 py-2
            rounded-full
            transition-all duration-300
            ${isActive ? "text-[#1D5D7F]" : "text-[#e6eef8]"}
          `}
        >
          {isActive && (
            <span className="absolute inset-0 bg-[#F4F4EE] rounded-full -z-10" />
          )}

          <IconComponent className="w-6 h-6 md:w-7 md:h-7" />
          <span className="text-[12px] md:text-[14px] whitespace-nowrap">
            {item.label}
          </span>
        </button>
      );
    });

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-3 left-3 z-[60] p-2 rounded-lg bg-[#1D5D7F] text-white hover:bg-[#2a7aa3] transition-colors shadow-lg"
        aria-label="Menu"
      >
        {mobileMenuOpen ? (
          <HiX className="w-6 h-6" />
        ) : (
          <HiMenuAlt3 className="w-6 h-6" />
        )}
      </button>

      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed
          top-0 left-0
          w-64 md:w-52
          h-screen
          bg-[#1D5D7F]
          
          flex flex-col
          items-stretch
          p-4

          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0

          z-50
        `}
      >
        <div className="flex justify-center items-center mb-3 mt-2">
          <img
            src={LogoDasboard}
            alt="Logo Sapiros"
            onClick={() => {
              navigateTo("home");
              setMobileMenuOpen(false);
            }}
            className="w-32 md:w-36 lg:w-40 h-auto object-contain cursor-pointer"
          />
        </div>

        <nav
          className="
            flex flex-col
            gap-3
            mt-8 md:mt-20
            overflow-y-auto
            flex-1
          "
        >
          {renderMenu(menuItems)}
        </nav>

        <nav className="flex flex-col gap-4 mt-auto mb-2">
          {renderMenu(bottomMenuItems)}
        </nav>
      </aside>
    </>
  );
}
