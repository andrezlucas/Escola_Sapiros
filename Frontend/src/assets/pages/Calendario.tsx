import { useEffect, useState } from "react";
import { CalendarioSemana } from "../components/CalendarioSemana";
import type { EventInput } from "@fullcalendar/core";
import CardCalendario from "../components/CardCalendario";
import { MdEvent } from "react-icons/md";
import "../css/CalendarioStyle.css";
import ModalVisualizarAviso from "../components/ModalVisualizarAviso";

interface AvisoBackend {
  id: string;
  nome: string;
  descricao: string;
  tipo: "GERAL" | "TURMA" | "INDIVIDUAL";
  categoria: string;
  dataInicio: string;
  dataFinal?: string;
  turma?: {
    id: string;
    nome_turma: string;
  } | null;
  destinatarioAlunoId?: string | null;
}

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<EventInput[]>([]);
  const [avisosBackend, setAvisosBackend] = useState<AvisoBackend[]>([]);
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avisoVisualizar, setAvisoVisualizar] = useState<AvisoBackend | null>(
    null
  );

  function getCorPorCategoria(categoria: string): string {
    const cores: Record<string, string> = {
      ACADEMICO: "#3D7E8F",
      SECRETARIA: "#4CAF50",
      EVENTO: "#FF9800",
      URGENTE: "#F44336",
      FERIADO: "#9C27B0",
      TECNOLOGIA: "#2196F3",
    };
    return cores[categoria] || "#3D7E8F";
  }

  function normalizarDataParaCalendario(
    dataString: string,
    isEndOfDay = false
  ) {
    const data = new Date(dataString);

    if (isNaN(data.getTime())) {
      console.error("Data inválida:", dataString);
      return new Date();
    }

    const horasUTC = data.getUTCHours();
    const minutosUTC = data.getUTCMinutes();
    const segundosUTC = data.getUTCSeconds();

    if (
      horasUTC === 0 &&
      minutosUTC === 0 &&
      segundosUTC === 0 &&
      !isEndOfDay
    ) {
      const dataLocal = new Date(
        data.getUTCFullYear(),
        data.getUTCMonth(),
        data.getUTCDate()
      );
      return dataLocal;
    }

    if (
      isEndOfDay &&
      horasUTC === 23 &&
      minutosUTC === 59 &&
      segundosUTC === 59
    ) {
      const dataLocal = new Date(
        data.getUTCFullYear(),
        data.getUTCMonth(),
        data.getUTCDate(),
        23,
        59,
        59
      );
      return dataLocal;
    }

    return data;
  }

  async function carregarAvisosCalendario() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token não encontrado");
        setLoading(false);
        return;
      }

      const inicioSemana = new Date(currentDate);
      inicioSemana.setDate(currentDate.getDate() - currentDate.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(fimSemana.getDate() + 6);
      fimSemana.setHours(23, 59, 59, 999);

      const inicioISO = inicioSemana.toISOString();
      const fimISO = fimSemana.toISOString();

      const response = await fetch(
        `http://localhost:3000/avisos/calendario?inicio=${inicioISO}&fim=${fimISO}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Avisos recebidos do backend:", data);
      setAvisosBackend(data);

      const eventosConvertidos = data.map((aviso: any) => {
        const cor = getCorPorCategoria(aviso.categoria);

        const dataInicio = normalizarDataParaCalendario(aviso.dataInicio);

        let dataFim;
        if (aviso.dataFinal) {
          const dataFinalObj = new Date(aviso.dataFinal);
          const isEndOfDay =
            dataFinalObj.getUTCHours() === 23 &&
            dataFinalObj.getUTCMinutes() === 59 &&
            dataFinalObj.getUTCSeconds() === 59;

          dataFim = normalizarDataParaCalendario(aviso.dataFinal, isEndOfDay);
        } else {
          dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000);
        }

        const isAllDayEvent =
          aviso.dataInicio.includes("T00:00:00") &&
          (!aviso.dataFinal || aviso.dataFinal.includes("T00:00:00")) &&
          (aviso.categoria === "FERIADO" || aviso.tipo === "GERAL");

        return {
          id: `aviso-${aviso.id}`,
          title: aviso.nome,
          start: dataInicio,
          end: dataFim,
          backgroundColor: cor,
          borderColor: cor,
          allDay: isAllDayEvent,
          extendedProps: {
            descricao: aviso.descricao,
            categoria: aviso.categoria,
            tipo: aviso.tipo,
            avisoId: aviso.id,
            turma: aviso.turma,
            destinatarioAlunoId: aviso.destinatarioAlunoId,
            isAviso: true,
          },
        };
      });

      const eventosExistentes = eventos.filter(
        (e) => !e.extendedProps?.isAviso
      );
      setEventos([...eventosExistentes, ...eventosConvertidos]);
    } catch (error) {
      console.error("Erro ao carregar avisos do calendário:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatarDataUTC = (dataString: string): string => {
    if (!dataString) return "";
    const date = new Date(dataString);
    if (isNaN(date.getTime())) return "";

    const dia = date.getUTCDate().toString().padStart(2, "0");
    const mes = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const ano = date.getUTCFullYear();

    return `${dia}/${mes}/${ano}`;
  };

  async function confirmarLeituraAviso(avisoId: string) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/avisos/${avisoId}/confirmar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setAvisosBackend((prev) =>
          prev.filter((aviso) => aviso.id !== avisoId)
        );
        setEventos((prev) =>
          prev.filter((evento) => evento.extendedProps?.avisoId !== avisoId)
        );
      }
    } catch (error) {
      console.error("Erro ao confirmar leitura:", error);
    }
  }

  useEffect(() => {
    carregarAvisosCalendario();
  }, [currentDate]);

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

  function handleCellClick(date: Date, hour: number) {
    const dataComHora = new Date(date);
    dataComHora.setHours(hour, 0, 0, 0);

    setEventoSelecionado({
      id: crypto.randomUUID(),
      titulo: "",
      inicio: dataComHora.toISOString().slice(0, 16),
      fim: new Date(dataComHora.getTime() + 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16),
      descricao: "",
      categoria: "ACADEMICO",
      cor: "#3D7E8F",
    });
    setOpen(true);
  }

  function handleEventClick(event: EventInput) {
    const inicio = new Date(event.start as any);
    const fim = new Date(event.end as any);

    const eventoData = {
      id: event.id,
      titulo: event.title || "",
      inicio: inicio.toISOString().slice(0, 16),
      fim: fim.toISOString().slice(0, 16),
      descricao: event.extendedProps?.descricao || "",
      categoria: event.extendedProps?.categoria || "ACADEMICO",
      cor: (event.backgroundColor as string) || "#3D7E8F",
      avisoId: event.extendedProps?.avisoId,
      tipo: event.extendedProps?.tipo,
      isAviso: event.extendedProps?.isAviso,
    };

    setEventoSelecionado(eventoData);
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
        isAviso: false,
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

  function abrirModalVisualizarAviso(aviso: AvisoBackend) {
    setAvisoVisualizar(aviso);
  }

  return (
    <div>
      <div className="p-2">
        <div className="p-2">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 h-15">
              <div>
                <p className="px-2 font-semibold">{nome}</p>
                <p className="px-2 text-sm text-gray-500">
                  {LetraMaiuscula(role)}
                </p>
              </div>
              <div className="ml-160">
                <span className="px-3 py-2text-sm ">
                  {LetraMaiuscula(role)}
                </span>
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
          </header>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D5D7F] mx-auto mb-4"></div>
              <p className="text-gray-500">
                Carregando avisos do calendário...
              </p>
            </div>
          </div>
        ) : (
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

              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-[#1D5D7F] mb-3">
                  Avisos desta semana
                </h3>
                {avisosBackend.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhum aviso para esta semana
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {avisosBackend.slice(0, 5).map((aviso) => (
                      <div
                        key={aviso.id}
                        className="p-3 border-l-4 rounded-r border-gray-200 hover:bg-gray-50 cursor-pointer"
                        style={{
                          borderLeftColor: getCorPorCategoria(aviso.categoria),
                        }}
                        onClick={() => abrirModalVisualizarAviso(aviso)}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-gray-500">
                            {aviso.categoria}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {aviso.tipo}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mt-1">
                          {aviso.nome}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {aviso.descricao}
                        </p>
                        <div className="text-xs text-gray-400 mt-2">
                          {formatarDataUTC(aviso.dataInicio)}
                          {aviso.dataFinal && (
                            <> – {formatarDataUTC(aviso.dataFinal)}</>
                          )}
                        </div>
                      </div>
                    ))}
                    {avisoVisualizar && (
                      <ModalVisualizarAviso
                        aviso={avisoVisualizar}
                        onClose={() => setAvisoVisualizar(null)}
                      ></ModalVisualizarAviso>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
