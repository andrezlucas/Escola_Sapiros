import React from "react";

interface CardMenuProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const CardMenu: React.FC<CardMenuProps> = ({ title, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-full h-[120px] sm:h-[150px] p-4 sm:p-5 bg-white rounded-xl 
                 flex flex-col justify-between cursor-pointer 
                 hover:shadow-lg transition-all"
    >
      <div className="w-full flex justify-center items-center flex-1">
        <div className="w-fit h-fit">{icon}</div>
      </div>

      <div className="w-full flex justify-center items-center">
        <p className="text-sm sm:text-lg font-semibold text-[#1D5D7F] text-center leading-snug">
          {title}
        </p>
      </div>
    </div>
  );
};

export default CardMenu;
