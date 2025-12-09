import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/react-calendario.css";
import type { Value } from "react-calendar/dist/shared/types.js";

interface CardCalendarioProps {
  type?: "full" | "mini";
}

const CardCalendario: React.FC<CardCalendarioProps> = ({ type = "full" }) => {
  const [value, setValue] = useState<Value>(new Date());

  return (
    <div
      className={
        type === "mini"
          ? "border-gray-200 rounded-xl p-3 flex justify-center"
          : "w-full border-gray-200 rounded-xl p-9 mt-4 flex justify-center"
      }
    >
      <div
        className={
          type === "mini" ? "scale-75 origin-top" : "scale-110 origin-top"
        }
      >
        <Calendar
          className={type === "mini" ? "mini-calendar" : "custom-calendar"}
          onChange={(v: Value) => setValue(v)}
          value={value}
          locale="pt-BR"
        />
      </div>
    </div>
  );
};

export default CardCalendario;
