import { useMemo } from "react";
import type { EventInput, DateInput } from "@fullcalendar/core";

type Props = {
  eventos: EventInput[];
  date: Date;
  onEventClick?: (event: EventInput) => void;
  onCellClick?: (date: Date, hour: number) => void;
};

const parseDateInput = (value: DateInput | undefined): Date | null => {
  if (!value) return null;

  try {
    if (Array.isArray(value)) {
      const [year, month, day] = value;
      return new Date(year, month - 1, day);
    }

    const d = new Date(value as any);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const formatTime = (value: DateInput | undefined): string => {
  const d = parseDateInput(value);
  if (!d) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

export function CalendarioSemana({
  eventos,
  date,
  onEventClick,
  onCellClick,
}: Props) {
  const weekDays = useMemo(() => {
    const current = new Date(date);
    const dayOfWeek = current.getDay();
    const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const start = new Date(current);
    start.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [date]);

  const timeSlots = [
    { hour: 7, label: "7:00" },
    { hour: 8, label: "8:00" },
    { hour: 9, label: "9:00" },
    { hour: 10, label: "10:00" },
    { hour: 11, label: "11:00" },
    { hour: 12, label: "12:00" },
    { hour: 13, label: "13:00" },
  ];

  const formatDayHeader = (date: Date) => {
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return `${dayNames[date.getDay()]}.${String(date.getDate()).padStart(
      2,
      "0"
    )}`;
  };

  const isToday = (d: Date) => {
    const t = new Date();
    return (
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  };

  const isEventInTimeSlot = (event: EventInput, day: Date, hour: number) => {
    const start = parseDateInput(event.start);
    const end = parseDateInput(event.end);

    if (!start || !end) return false;

    const startH = start.getHours();
    const endH = end.getHours();

    const sameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const isStartDay = sameDay(day, start);
    const isEndDay = sameDay(day, end);

    if (!isStartDay && !isEndDay) return false;

    return (isStartDay && hour === startH) || (isEndDay && hour === endH);
  };

  const getFullDayEvents = (day: Date) => {
    return eventos.filter((ev) => {
      const d = parseDateInput(ev.start);
      if (!d) return false;

      const isAllDay =
        d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;

      const sameDay =
        d.getDate() === day.getDate() &&
        d.getMonth() === day.getMonth() &&
        d.getFullYear() === day.getFullYear();

      return isAllDay && sameDay;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-4 text-center font-medium text-gray-500 border-r border-gray-200">
          Hora
        </div>

        {weekDays.map((day, i) => {
          const fullDayEvents = getFullDayEvents(day);

          return (
            <div
              key={i}
              className={`p-4 text-center border-r border-gray-200 ${
                isToday(day) ? "bg-blue-50" : ""
              } ${i === 6 ? "border-r-0" : ""}`}
            >
              <div
                className={`font-medium ${
                  isToday(day) ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {formatDayHeader(day)}
              </div>

              {fullDayEvents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {fullDayEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor:
                          (event.backgroundColor as string) ?? "#E6F2F8",
                        color: "#1D5D7F",
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="divide-y divide-gray-200">
        {timeSlots.map((slot, sIdx) => (
          <div key={sIdx} className="grid grid-cols-8">
            <div className="p-4 text-center text-gray-500 border-r border-gray-200">
              {slot.label}
            </div>

            {weekDays.map((day, dIdx) => {
              const eventsForSlot = eventos.filter((ev) =>
                isEventInTimeSlot(ev, day, slot.hour)
              );

              return (
                <div
                  key={dIdx}
                  className={`min-h-[100px] p-2 border-r border-gray-200 
                    ${dIdx === 6 ? "border-r-0" : ""}
                    ${isToday(day) ? "bg-blue-50" : ""}
                    ${
                      eventsForSlot.length === 0
                        ? "hover:bg-gray-50 cursor-pointer"
                        : ""
                    }
                  `}
                  onClick={() => {
                    if (eventsForSlot.length === 0 && onCellClick) {
                      const newDate = new Date(day);
                      newDate.setHours(slot.hour, 0, 0, 0);
                      onCellClick(newDate, slot.hour);
                    }
                  }}
                >
                  {eventsForSlot.map((event, idx) => (
                    <div
                      key={idx}
                      className="mb-2 p-3 rounded-lg shadow-sm border-l-4 hover:shadow-md cursor-pointer"
                      style={{
                        backgroundColor:
                          (event.backgroundColor as string) ?? "#3D7E8F",
                        borderLeftColor:
                          (event.backgroundColor as string) ?? "#3D7E8F",
                        color: "white",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="text-xs font-medium opacity-90 mb-1">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </div>

                      <div className="font-semibold text-sm">{event.title}</div>

                      {event.extendedProps?.descricao && (
                        <div className="text-xs mt-1 opacity-90">
                          {event.extendedProps.descricao}
                        </div>
                      )}

                      {event.extendedProps?.categoria && (
                        <div className="text-xs mt-1 opacity-90">
                          {event.extendedProps.categoria}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
