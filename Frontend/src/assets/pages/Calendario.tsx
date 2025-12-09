import { useState } from "react";
import { CalendarioSemana } from "../components/CalendarioSemana";
import type { EventInput } from "@fullcalendar/core";
import CardCalendario from "../components/CardCalendario";
import { MdEvent } from "react-icons/md";
import NovoEvento from "../components/NovoEvento";
import "../css/CalendarioStyle.css";

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<EventInput[]>([]);
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  function semanaAnterior() {
    setCurrentDate((prev) => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() - 7);
      return nova;
    });
  }

  function proximaSemana() {
    setCurrentDate((prev) => {
      const nova = new Date(prev);
      nova.setDate(nova.getDate() + 7);
      return nova;
    });
  }

  return (
    <div className="w-full h-auto p-8 bg-white rounded-xl shadow-md flex flex-col gap-4">
      <div className="p-2">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src="/avatar.png"
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold">Felipe de Melo</p>
              <p className="text-sm text-gray-500">email@gmail.com</p>
            </div>
            <div className="flex items-end gap-3">Secretaria</div>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
            <button
              aria-label="Anterior"
              className="px-2"
              onClick={semanaAnterior}
            >
              &lt;
            </button>

            <input
              type="date"
              value={currentDate.toISOString().split("T")[0]}
              onChange={(e) => setCurrentDate(new Date(e.target.value))}
              className="border rounded px-2 py-1"
            />

            <button
              aria-label="Próximo"
              className="px-2"
              onClick={proximaSemana}
            >
              &gt;
            </button>
          </div>

          <button onClick={() => setOpen(true)}>
            <MdEvent size={25} />
          </button>
        </header>

        <div className="flex gap-6">
          <div className="flex-1">
            <CalendarioSemana eventos={eventos} date={currentDate} />
          </div>

          <aside className="w-[260px]">
            <div className="scale-135 origin-top">
              <CardCalendario type="mini" />
            </div>
          </aside>
        </div>
      </div>

      {open && (
        <NovoEvento
          onClose={() => setOpen(false)}
          onSave={(evento) => {
            const novoEvento: EventInput = {
              id: evento.id,
              title: evento.titulo,
              start: evento.inicio,
              end: evento.fim,
              backgroundColor: evento.cor,
              extendedProps: {
                descricao: evento.descricao,
                categoria: evento.categoria,
              },
            };

            setEventos((prev) => [...prev, novoEvento]);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
