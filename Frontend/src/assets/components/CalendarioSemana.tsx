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

const formatDate = (value: DateInput | undefined): string => {
  const d = parseDateInput(value);
  if (!d) return "";
  return d.toLocaleDateString("pt-BR");
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
    { hour: 14, label: "14:00" },
    { hour: 15, label: "15:00" },
    { hour: 16, label: "16:00" },
    { hour: 17, label: "17:00" },
    { hour: 18, label: "18:00" },
  ];

  const formatDayHeader = (date: Date) => {
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return {
      name: dayNames[date.getDay()],
      day: String(date.getDate()).padStart(2, "0"),
    };
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

    if (isStartDay) {
      return hour === startH || (hour > startH && hour <= endH);
    }

    if (isEndDay) {
      return hour === endH;
    }

    return false;
  };

  const isAllDayEvent = (event: EventInput) => {
    const start = parseDateInput(event.start);
    const end = parseDateInput(event.end);

    if (!start || !end) return false;

    const isMidnightStart =
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      start.getSeconds() === 0;

    const duration = end.getTime() - start.getTime();
    const isFullDay = duration >= 23 * 60 * 60 * 1000;

    return isMidnightStart || isFullDay;
  };

  const getFullDayEvents = (day: Date) => {
    return eventos.filter((ev) => {
      const start = parseDateInput(ev.start);
      if (!start) return false;

      const sameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      const startsOnDay = sameDay(day, start);
      const isAllDay = isAllDayEvent(ev);

      return isAllDay && startsOnDay;
    });
  };

  const getDayEvents = (day: Date) => {
    return eventos.filter((ev) => {
      const start = parseDateInput(ev.start);
      const end = parseDateInput(ev.end);

      if (!start || !end) return false;

      const sameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      const startsOnDay = sameDay(day, start);
      const endsOnDay = sameDay(day, end);
      const isAllDay = isAllDayEvent(ev);

      return !isAllDay && (startsOnDay || endsOnDay);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-1 md:p-4 flex items-center justify-center text-center font-medium text-gray-500 border-r border-gray-200 text-[10px] md:text-sm">
          Hora
        </div>

        {weekDays.map((day, i) => {
          const fullDayEvents = getFullDayEvents(day);
          const dayEvents = getDayEvents(day);
          const header = formatDayHeader(day);

          return (
            <div
              key={i}
              className={`p-1 md:p-4 text-center border-r border-gray-200 ${
                isToday(day) ? "bg-blue-50" : ""
              } ${i === 6 ? "border-r-0" : ""}`}
            >
              <div
                className={`flex flex-col items-center justify-center font-medium leading-tight ${
                  isToday(day) ? "text-blue-600" : "text-gray-700"
                }`}
              >
                <span className="text-[9px] md:text-xs uppercase opacity-70">
                  {header.name}
                </span>
                <span className="text-[11px] md:text-sm font-bold">
                  {header.day}
                </span>
              </div>

              {fullDayEvents.length > 0 && (
                <div className="mt-1 md:mt-2 space-y-1">
                  {fullDayEvents.map((event, idx) => (
                    <div
                      key={idx}
                      className="text-[8px] md:text-xs px-0.5 md:px-2 py-0.5 md:py-1 rounded cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor:
                          (event.backgroundColor as string) ?? "#E6F2F8",
                        color: "#1D5D7F",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="font-semibold truncate">
                        {event.title}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {dayEvents.length > 0 && fullDayEvents.length === 0 && (
                <div className="mt-1 md:mt-2 space-y-1">
                  {dayEvents.slice(0, 1).map((event, idx) => {
                    return (
                      <div
                        key={idx}
                        className="text-[8px] md:text-xs px-0.5 md:px-2 py-0.5 md:py-1 rounded cursor-pointer hover:opacity-90"
                        style={{
                          backgroundColor:
                            (event.backgroundColor as string) ?? "#E6F2F8",
                          color: "#1D5D7F",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <div className="font-semibold truncate">
                          {event.title}
                        </div>
                      </div>
                    );
                  })}
                  {dayEvents.length > 1 && (
                    <div className="text-[7px] md:text-[10px] text-gray-500 mt-0.5">
                      +{dayEvents.length - 1}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="divide-y divide-gray-200">
        {timeSlots.map((slot, sIdx) => (
          <div key={sIdx} className="grid grid-cols-8">
            <div className="p-1 md:p-4 flex items-center justify-center text-center text-gray-500 border-r border-gray-200 text-[10px] md:text-sm">
              {slot.label}
            </div>

            {weekDays.map((day, dIdx) => {
              const eventsForSlot = eventos.filter((ev) =>
                isEventInTimeSlot(ev, day, slot.hour),
              );

              return (
                <div
                  key={dIdx}
                  className={`min-h-[60px] md:min-h-[100px] p-0.5 md:p-2 border-r border-gray-200 
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
                  {eventsForSlot.map((event, idx) => {
                    const start = parseDateInput(event.start);
                    const end = parseDateInput(event.end);
                    const duration =
                      start && end
                        ? (end.getTime() - start.getTime()) / (60 * 60 * 1000)
                        : 1;
                    const isLongEvent = duration > 1;

                    return (
                      <div
                        key={idx}
                        className={`mb-0.5 md:mb-2 p-1 md:p-3 rounded-md md:rounded-lg shadow-sm border-l-2 md:border-l-4 hover:shadow-md cursor-pointer ${
                          isLongEvent ? "min-h-[40px] md:min-h-[60px]" : ""
                        }`}
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
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-0.5">
                          <div className="text-[7px] md:text-xs font-medium opacity-90">
                            {formatTime(event.start)}
                          </div>
                          {event.extendedProps?.tipo && (
                            <span className="text-[6px] md:text-[10px] bg-white/20 px-0.5 md:px-1 rounded self-start">
                              {event.extendedProps.tipo}
                            </span>
                          )}
                        </div>

                        <div className="font-semibold text-[8px] md:text-sm truncate mt-0.5">
                          {event.title}
                        </div>

                        {event.extendedProps?.categoria && (
                          <div className="hidden md:block text-[9px] md:text-xs mt-1 opacity-90">
                            <span className="bg-white/20 px-1 rounded">
                              {event.extendedProps.categoria}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
