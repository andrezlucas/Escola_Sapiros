import { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, EventContentArg } from "@fullcalendar/core";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

type Props = {
  eventos: EventInput[];
  date: Date;
};

export function CalendarioSemana({ eventos, date }: Props) {
  const calendarRef = useRef<FullCalendar | null>(null);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(date);
    }
  }, [date]);

  return (
    <div className="bg-white p-4 rounded-xl shadow w-full h-[700px]">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        slotMinTime="08:00:00"
        slotMaxTime="13:00:00"
        allDaySlot={false}
        events={eventos}
        height="100%"
        locale={ptBrLocale}
        eventContent={renderEvent}
        dayHeaderContent={(args) => {
          const text = args.text;
          return text.charAt(0).toUpperCase() + text.slice(1);
        }}
      />
    </div>
  );
}

function renderEvent(info: EventContentArg) {
  const backgroundColor = info.event.backgroundColor;
  const title = info.event.title;

  const startTime = info.event.start?.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = info.event.end?.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="w-40 h-24 rounded-lg p-3 shadow-sm flex flex-flex gap-1"
      style={{
        backgroundColor: backgroundColor || "#3D7E8F",
        color: "white",
      }}
    >
      <p className="text-[12px] opacity-90">
        {startTime} - {endTime}
      </p>

      <p className="font-semibold text-sm leading-tight">{title}</p>
    </div>
  );
}
