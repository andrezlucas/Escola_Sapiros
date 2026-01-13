import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Usuario {
  nome: string;
  email: string;
  telefone: string;
  role: string;
}

interface Turma {
  id: string;
  nome_turma: string;
}

interface PerfilAluno {
  turma?: Turma;
}

interface PerfilResponse {
  usuario: Usuario;
  perfil?: PerfilAluno;
}

const FormEditarPerfil: React.FC = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [turmaNome, setTurmaNome] = useState<string>("—");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Não autenticado. Faça login novamente.");

        const response = await fetch(
          "http://localhost:3000/configuracoes/perfil",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Erro ${response.status}: ${errText}`);
        }

        const data: PerfilResponse = await response.json();

        setUsuario(data.usuario);
        setFormData({
          nome: data.usuario?.nome || "",
          email: data.usuario?.email || "",
          telefone: data.usuario?.telefone || "",
        });

        if (
          data.usuario.role.toLowerCase() === "aluno" &&
          data.perfil?.turma?.nome_turma
        ) {
          setTurmaNome(data.perfil.turma.nome_turma);
        } else {
          setTurmaNome("");
        }
      } catch (err: any) {
        console.error("Erro ao carregar perfil:", err);
        setError(err.message || "Falha ao carregar informações do perfil");
        setTurmaNome("Erro ao carregar turma");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Não autenticado");

      const payload: any = {};
      if (formData.nome && formData.nome !== usuario?.nome)
        payload.nome = formData.nome;
      if (formData.email && formData.email !== usuario?.email)
        payload.email = formData.email;
      if (formData.telefone && formData.telefone !== usuario?.telefone)
        payload.telefone = formData.telefone;

      const response = await fetch(
        "http://localhost:3000/configuracoes/perfil",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erro ao atualizar perfil");
      }

      setSuccess("Perfil atualizado com sucesso!");
      setUsuario((prev) => (prev ? { ...prev, nome: formData.nome } : null));
    } catch (err: any) {
      setError(err.message || "Falha na atualização do perfil");
    }
  };

  const handleRedirectToChangePassword = () => {
    navigate("/redefinir-senha");
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600">
        Carregando perfil...
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl p-8 shadow-md">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-[#1D5D7F] flex items-center justify-center text-white text-3xl font-bold">
          FOTO
        </div>
        <div>
          <h2 className="font-bold text-2xl text-[#1D5D7F]">
            {usuario?.nome || formData.nome || "Nome"}
          </h2>
          <p className="text-lg text-gray-600">
            {usuario?.role.toLowerCase() === "aluno" ? turmaNome : "—"}
          </p>
        </div>
      </div>

      <h3 className="font-bold text-xl mb-6 text-[#1D5D7F]">Editar Perfil</h3>

      {error && (
        <p className="text-red-600 mb-4 bg-red-50 p-3 rounded">{error}</p>
      )}
      {success && (
        <p className="text-green-600 mb-4 bg-green-50 p-3 rounded">{success}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo:
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            placeholder="Digite seu nome completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            placeholder="seuemail@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone:
          </label>
          <input
            type="tel"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F]"
            placeholder="(DD) 99999-9999"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha:
          </label>
          <div className="flex items-center gap-3">
            <input
              type="password"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D5D7F] bg-gray-100 cursor-not-allowed"
              placeholder="••••••••"
              disabled
            />
            <button
              type="button"
              onClick={handleRedirectToChangePassword}
              className="px-6 py-3 bg-[#1D5D7F] text-white rounded-lg font-medium hover:bg-[#1D5D7F]/90 transition whitespace-nowrap"
            >
              Alterar
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            type="button"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-[#1D5D7F] text-white rounded-lg font-medium hover:bg-[#1D5D7F]/90 transition"
          >
            Concluir
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormEditarPerfil;
