import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/react-calendario.css";
import type { Value } from "react-calendar/dist/shared/types.js";

const MiniCalendar: React.FC = () => {
  const [value, setValue] = useState<Value>(new Date());

  return (
    <Calendar
      onChange={(v: Value) => setValue(v)}
      value={value}
      locale="pt-BR"
      className="mini-calendar"
    />
  );
};

export default MiniCalendar;
