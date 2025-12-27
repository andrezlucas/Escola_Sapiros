import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles: Array<"coordenacao" | "aluno" | "professor">;
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") as
    | "coordenacao"
    | "aluno"
    | "professor"
    | null;

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  return children;
}
