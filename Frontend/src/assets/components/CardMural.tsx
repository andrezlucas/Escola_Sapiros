import React from "react";

interface CardMuralProps {
  type: "full" | "mini";
  className?: string;
}

const CardMural: React.FC<CardMuralProps> = ({ type, className }) => {
  const isFull = type === "full";

  return (
    <div
      className={`
        w-full ${isFull ? "h-full" : "h-[400px]"}
        p-8 rounded-xl
        bg-white shadow-md
        ${className || ""}
      `}
    >
      {!isFull && (
        <div className="w-full h-full flex items-center justify-center"></div>
      )}
    </div>
  );
};

export default CardMural;
