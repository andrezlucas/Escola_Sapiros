import React, { useState } from "react";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { FaRegEdit } from "react-icons/fa";
import {
  HiOutlineCalendarDateRange,
  HiOutlineAcademicCap,
  HiOutlineCog8Tooth,
  HiOutlineArrowLeftStartOnRectangle,
} from "react-icons/hi2";
import { IoHomeOutline } from "react-icons/io5";
import { IoMdTv } from "react-icons/io";
import { MdOutlineManageAccounts } from "react-icons/md";
import LogoDasboard from "../imagens/logodasboard.png";

interface SideBarMenuProps {
  navigateTo: (viewName: string) => void;
}

function SideBarMenu({ navigateTo }: SideBarMenuProps) {
  const [active, setActive] = useState("dashboard/coordenacao");

  const menuItems = [
    { icon: IoHomeOutline, label: "Home", viewName: "dashboard/coordenacao" },
    {
      icon: HiOutlineClipboardDocumentList,
      label: "Documentos",
      viewName: "documentos",
    },
    { icon: FaRegEdit, label: "Matrícula", viewName: "matriculas" },
    {
      icon: MdOutlineManageAccounts,
      label: "Gerenciamento",
      viewName: "gerenciamento",
    },
    {
      icon: HiOutlineCalendarDateRange,
      label: "Calendário",
      viewName: "calendario",
    },
    { icon: HiOutlineAcademicCap, label: "Relatórios", viewName: "relatorios" },
    { icon: IoMdTv, label: "Mural", viewName: "mural" },
  ];

  const bottomMenuItems = [
    {
      icon: HiOutlineCog8Tooth,
      label: "Configurações",
      viewName: "configuracoes",
    },
    {
      icon: HiOutlineArrowLeftStartOnRectangle,
      label: "Logout",
      viewName: "logout",
    },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-52 bg-[#1D5D7F] flex flex-col p-4">
      <div className="flex justify-center items-center mb-3 mt-2">
        <img
          src={LogoDasboard}
          alt="Logo Sapiros"
          onClick={() => {
            navigateTo("dashboard/coordenacao");
            setActive("dashboard/coordenacao");
          }}
          className="w-28 md:w-36 lg:w-40 h-auto object-contain cursor-pointer"
        />
      </div>

      <nav className="flex flex-col gap-3 mt-20">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;

          const isActive = active === item.viewName;

          return (
            <button
              key={index}
              onClick={() => {
                navigateTo(item.viewName);
                setActive(item.viewName);
              }}
              className={`
                relative flex items-center gap-3 px-4 py-2 rounded-full overflow-hidden
                transition-all duration-300
                ${isActive ? "text-[#1D5D7F]" : "text-[#e6eef8]"}
              `}
            >
              {isActive && (
                <span
                  className="
                    absolute inset-0 bg-[#F4F4EE] rounded-full -z-10
                    animate-[fadeIn_0.2s_ease-out]
                  "
                />
              )}

              <IconComponent className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-[13px] md:text-[14px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <nav className="flex flex-col gap-4 mt-auto mb-2">
        {bottomMenuItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = active === item.viewName;

          return (
            <button
              key={index}
              onClick={() => {
                navigateTo(item.viewName);
                setActive(item.viewName);
              }}
              className={`
                relative flex items-center gap-3 px-4 py-2 rounded-full
                transition-all duration-300
                ${isActive ? "text-[#1D5D7F]" : "text-[#e6eef8]"}
              `}
            >
              {isActive && (
                <span
                  className="
                    absolute inset-0 bg-[#F4F4EE] rounded-full -z-10
                    animate-[fadeIn_0.2s_ease-out]
                  "
                />
              )}

              <IconComponent className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-[13px] md:text-[14px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default SideBarMenu;
