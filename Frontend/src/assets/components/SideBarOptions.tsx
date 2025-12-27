import {
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDateRange,
  HiOutlineAcademicCap,
  HiOutlineCog8Tooth,
  HiOutlineArrowLeftStartOnRectangle,
} from "react-icons/hi2";
import { FaRegEdit } from "react-icons/fa";
import { IoHomeOutline } from "react-icons/io5";
import { IoMdTv } from "react-icons/io";
import { MdOutlineManageAccounts } from "react-icons/md";
import { FaRegFolderOpen } from "react-icons/fa";
import { IoBarChartOutline } from "react-icons/io5";

export const SideBarOptions = {
  coordenacao: {
    main: [
      { icon: IoHomeOutline, label: "Home", viewName: "home" },
      {
        icon: HiOutlineClipboardDocumentList,
        label: "Documentos",
        viewName: "documentos",
      },
      { icon: FaRegEdit, label: "Matrícula", viewName: "matriculas" },
      {
        icon: MdOutlineManageAccounts,
        label: "Gerenciamento",
        viewName: "gerenciamento",
      },
      {
        icon: HiOutlineCalendarDateRange,
        label: "Calendário",
        viewName: "calendario",
      },
      {
        icon: IoBarChartOutline,
        label: "Relatórios",
        viewName: "relatorios",
      },
      { icon: IoMdTv, label: "Mural", viewName: "mural" },
    ],
    bottom: [
      {
        icon: HiOutlineCog8Tooth,
        label: "Configurações",
        viewName: "configuracoes",
      },
      {
        icon: HiOutlineArrowLeftStartOnRectangle,
        label: "Logout",
        viewName: "logout",
      },
    ],
  },
  aluno: {
    main: [
      { icon: IoHomeOutline, label: "Home", viewName: "home" },
      {
        icon: HiOutlineClipboardDocumentList,
        label: "Atividades",
        viewName: "atividades",
      },
      {
        icon: FaRegFolderOpen,
        label: "Materiais",
        viewName: "materiais",
      },
      {
        icon: HiOutlineCalendarDateRange,
        label: "Calendário",
        viewName: "calendario",
      },
      {
        icon: HiOutlineAcademicCap,
        label: "Enem",
        viewName: "enem",
      },
      { icon: IoMdTv, label: "Desempenho", viewName: "desempenho" },
    ],
    bottom: [
      {
        icon: HiOutlineCog8Tooth,
        label: "Configurações",
        viewName: "configuracoes",
      },
      {
        icon: HiOutlineArrowLeftStartOnRectangle,
        label: "Logout",
        viewName: "logout",
      },
    ],
  },

  professor: {
    main: [
      { icon: IoHomeOutline, label: "Home", viewName: "home" },
      {
        icon: HiOutlineClipboardDocumentList,
        label: "Minhas Turmas",
        viewName: "turmas",
      },
      { icon: FaRegEdit, label: "Lançar Notas", viewName: "lancarNotas" },
    ],
    bottom: [
      {
        icon: HiOutlineCog8Tooth,
        label: "Configurações",
        viewName: "configuracoes",
      },
      {
        icon: HiOutlineArrowLeftStartOnRectangle,
        label: "Logout",
        viewName: "logout",
      },
    ],
  },
  responsavel: {
    main: [
      { icon: IoHomeOutline, label: "Home", viewName: "dashboard/responsavel" },
      {
        icon: HiOutlineClipboardDocumentList,
        label: "Filhos",
        viewName: "filhos",
      },
      { icon: FaRegEdit, label: "Pagamentos", viewName: "pagamentos" },
    ],
    bottom: [
      {
        icon: HiOutlineCog8Tooth,
        label: "Configurações",
        viewName: "configuracoes",
      },
      {
        icon: HiOutlineArrowLeftStartOnRectangle,
        label: "Logout",
        viewName: "logout",
      },
    ],
  },
};
