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
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);

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

  function handleCellClick(date: Date) {
    setEventoSelecionado({
      id: crypto.randomUUID(),
      titulo: "",
      inicio: date.toISOString().slice(0, 16),
      fim: new Date(date.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16),
      descricao: "",
      categoria: "",
      cor: "#3D7E8F",
    });
    setOpen(true);
  }

  function handleEventClick(event: EventInput) {
    const inicio = new Date(event.start as any);
    const fim = new Date(event.end as any);

    setEventoSelecionado({
      id: event.id,
      titulo: event.title,
      inicio: inicio.toISOString().slice(0, 16),
      fim: fim.toISOString().slice(0, 16),
      descricao: event.extendedProps?.descricao,
      categoria: event.extendedProps?.categoria,
      cor: event.backgroundColor as string,
    });

    setOpen(true);
  }

  function handleSave(evento: any) {
    const novoEvento: EventInput = {
      id: evento.id,
      title: evento.titulo,
      start: new Date(evento.inicio),
      end: new Date(evento.fim),
      backgroundColor: evento.cor,
      extendedProps: {
        descricao: evento.descricao,
        categoria: evento.categoria,
      },
    };

    setEventos((prev) => {
      const existe = prev.find((e) => e.id === novoEvento.id);

      if (existe) {
        return prev.map((ev) => (ev.id === novoEvento.id ? novoEvento : ev));
      }

      return [...prev, novoEvento];
    });

    setOpen(false);
    setEventoSelecionado(null);
  }

  function handleDelete(id: string) {
    setEventos((prev) => prev.filter((ev) => ev.id !== id));
    setOpen(false);
    setEventoSelecionado(null);
  }

  const LetraMaiuscula = (texto?: string | null) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const nome = localStorage.getItem("nome");
  const role = localStorage.getItem("role");

  return (
    <div>
      <div className="p-2">
        <div className="p-2">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 h-15">
              <img
                src="/avatar.png"
                alt="avatar"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-semibold">{nome}</p>
                <p className="text-sm text-gray-500">{LetraMaiuscula(role)}</p>
              </div>
              <div className="ml-160">
                <span className="px-3 py-2text-sm ">{LetraMaiuscula(role)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 h-15">
              <button
                aria-label="Anterior"
                className="px-1 text-gray-600 hover:text-gray-900"
                onClick={semanaAnterior}
              >
                &lt;
              </button>
              <span className="font-medium text-gray-700 px-2">Semana</span>
              <button
                aria-label="Próximo"
                className="px-1 text-gray-600 hover:text-gray-900"
                onClick={proximaSemana}
              >
                &gt;
              </button>
            </div>

            <div>
              <button
                onClick={() => {
                  setEventoSelecionado(null);
                  setOpen(true);
                }}
                className="flex items-center justify-center w-24 h-15 bg-[#1D5D7F] text-white rounded-lg hover:bg-[#164A66]"
              >
                <MdEvent size={20} />
              </button>
            </div>
          </header>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <CalendarioSemana
              eventos={eventos}
              date={currentDate}
              onCellClick={handleCellClick}
              onEventClick={handleEventClick}
            />
          </div>

          <aside className="w-[260px]">
            <div className="scale-140 origin-top">
              <CardCalendario type="mini" />
            </div>
          </aside>
        </div>
      </div>

      {open && (
        <NovoEvento
          onClose={() => {
            setOpen(false);
            setEventoSelecionado(null);
          }}
          evento={eventoSelecionado}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
