import {
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDateRange,
  HiOutlineAcademicCap,
  HiOutlineCog8Tooth,
  HiOutlineArrowLeftStartOnRectangle,
} from "react-icons/hi2";
import { FaRegEdit } from "react-icons/fa";
import { IoDocumentOutline, IoHomeOutline } from "react-icons/io5";
import { IoMdTv } from "react-icons/io";
import { MdOutlineManageAccounts } from "react-icons/md";
import { FaRegFolderOpen } from "react-icons/fa";
import { IoBarChartOutline } from "react-icons/io5";
import { MdAppRegistration } from "react-icons/md";
import { HiOutlineSpeakerphone } from "react-icons/hi";

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
      { icon: HiOutlineSpeakerphone, label: "Mural", viewName: "mural" },
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
        viewName: "atividadesAluno",
      },
      {
        icon: FaRegFolderOpen,
        label: "Materiais",
        viewName: "materiais",
      },
      { icon: IoDocumentOutline, label: "Documentos", viewName: "documentos" },
      {
        icon: HiOutlineCalendarDateRange,
        label: "Calendário",
        viewName: "calendario",
      },
      {
        icon: HiOutlineAcademicCap,
        label: "Vestibular",
        viewName: "vestibular",
      },
      { icon: IoMdTv, label: "Desempenho", viewName: "desempenho" },
      { icon: HiOutlineSpeakerphone, label: "Mural", viewName: "mural" },
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
        label: "Atividades",
        viewName: "atividades",
      },
      { icon: FaRegFolderOpen, label: "Materiais", viewName: "materiais" },

      {
        icon: HiOutlineCalendarDateRange,
        label: "Calendário",
        viewName: "calendario",
      },

      {
        icon: HiOutlineAcademicCap,
        label: "Turmas",
        viewName: "minhas turmas",
      },

      {
        icon: MdAppRegistration,
        label: "Registro",
        viewName: "registro",
      },
      { icon: HiOutlineSpeakerphone, label: "Mural", viewName: "mural" },
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
