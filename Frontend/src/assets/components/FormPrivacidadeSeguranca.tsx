import { useEffect, useState } from "react";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { MdVerifiedUser, MdSecurity } from "react-icons/md";
import { authFetch } from "../utils/authFetch";
import { ToastConfirm } from "../utils/ToastConfirm";

function FormPrivacidadeSeguranca() {
  const [email, setEmail] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [ultimoLogin, setUltimoLogin] = useState<string | null>(null);

  const [senha2FA, setSenha2FA] = useState("");
  const [mostrarDesativar, setMostrarDesativar] = useState(false);

  const [loading, setLoading] = useState(false);

  const [codigosStatus, setCodigosStatus] = useState<{
    total: number;
    usados: number;
    restantes: number;
    detalhes: Array<{ usado: boolean; usadoEm: string | null }>;
  } | null>(null);
  const [codigosGerados, setCodigosGerados] = useState<string[]>([]);
  const [loadingCodigos, setLoadingCodigos] = useState(false);
  const [loadingGerar, setLoadingGerar] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function carregarDados() {
      try {
        if (!token) {
          toast.error("Sessão expirada. Faça login novamente.");
          return;
        }

        const res = await authFetch("http://localhost:3000/usuarios/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        setEmail(data.email);
        setTwoFAEnabled(Boolean(data.twoFactorEnabled));
        setUltimoLogin(data.ultimoLoginEm);

        const resCodigos = await authFetch(
          "http://localhost:3000/configuracoes/codigos-acesso",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (resCodigos.ok) {
          const codData = await resCodigos.json();
          setCodigosStatus(codData);
        }
      } catch {
        toast.error("Erro ao carregar dados de segurança");
      }
    }

    carregarDados();
  }, [token]);

  async function gerarQrCode() {
    setLoading(true);
    try {
      const res = await authFetch("http://localhost:3000/auth/2fa/gerar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setQrCode(data.qrCode);
      setSecret(data.base32);
    } catch {
      toast.error("Erro ao gerar QR Code");
    } finally {
      setLoading(false);
    }
  }

  async function ativar2FA() {
    if (code.length !== 6 || !secret) {
      toast.error("Código inválido");
      return;
    }

    try {
      const res = await authFetch("http://localhost:3000/auth/2fa/ativar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          codigo: code,
          secret,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Verificação em duas etapas ativada com sucesso");

      setTwoFAEnabled(true);
      setQrCode(null);
      setSecret(null);
      setCode("");
    } catch {
      toast.error("Código inválido");
    }
  }

  async function desativar2FA() {
    if (!senha2FA) {
      toast.error("Digite sua senha");
      return;
    }

    try {
      const res = await authFetch("http://localhost:3000/auth/2fa/desativar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senha: senha2FA }),
      });

      if (!res.ok) throw new Error();

      toast.success("2FA desativado com sucesso");

      setTwoFAEnabled(false);
      setSenha2FA("");
      setMostrarDesativar(false);
    } catch {
      toast.error("Senha inválida");
    }
  }

  async function gerarCodigosAcesso() {
    ToastConfirm(
      "Isso vai **substituir** todos os códigos antigos. Deseja continuar?",
      async () => {
        setLoadingGerar(true);
        try {
          const res = await authFetch(
            "http://localhost:3000/configuracoes/codigos-acesso",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Falha ao gerar códigos");
          }

          const data = await res.json();
          setCodigosGerados(data.codigos || []);
          toast.success("10 novos códigos gerados com sucesso!");

          const resStatus = await authFetch(
            "http://localhost:3000/configuracoes/codigos-acesso",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (resStatus.ok) {
            setCodigosStatus(await resStatus.json());
          }
        } catch (err: any) {
          toast.error(err.message || "Erro ao gerar códigos de recuperação");
        } finally {
          setLoadingGerar(false);
        }
      },
      () => {}
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl p-8 shadow-md space-y-6">
      <div>
        <p className="font-bold text-2xl text-[#1D5D7F]">E-mail</p>
        <p className="text-lg font-medium">{email || "Carregando..."}</p>
      </div>

      <hr />

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">
          Verificação em duas etapas (2FA)
        </h4>

        {!twoFAEnabled && !qrCode && (
          <Button onClick={gerarQrCode} disabled={loading}>
            Ativar verificação em duas etapas
          </Button>
        )}

        {qrCode && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Escaneie o QR Code com o Google Authenticator ou Authy e digite o
              código abaixo.
            </p>

            <img src={qrCode} alt="QR Code 2FA" className="w-48" />

            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="
                w-40 h-12 text-center text-xl tracking-widest
                border rounded-lg focus:outline-none focus:ring-2
                focus:ring-[#1D5D7F]
              "
            />

            <Button onClick={ativar2FA} disabled={code.length !== 6}>
              Confirmar ativação
            </Button>
          </div>
        )}

        {twoFAEnabled && (
          <div className="space-y-3">
            <p className="text-green-600 font-medium flex items-center gap-2">
              <MdVerifiedUser className="text-lg" />
              Verificação em duas etapas ativada
            </p>

            {ultimoLogin && (
              <p className="text-sm text-gray-600">
                Último login em {new Date(ultimoLogin).toLocaleString("pt-BR")}
              </p>
            )}

            {!mostrarDesativar && (
              <Button
                variant="danger"
                onClick={() => setMostrarDesativar(true)}
              >
                Desativar verificação em duas etapas
              </Button>
            )}

            {mostrarDesativar && (
              <div className="space-y-3 max-w-sm">
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha2FA}
                  onChange={(e) => setSenha2FA(e.target.value)}
                  className="
                    w-full h-12 px-4
                    border rounded-lg
                    focus:outline-none focus:ring-2
                    focus:ring-red-500
                  "
                />

                <div className="flex gap-2">
                  <Button onClick={desativar2FA}>Confirmar desativação</Button>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setMostrarDesativar(false);
                      setSenha2FA("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <hr />

      {twoFAEnabled && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            Códigos de Recuperação
          </h4>

          <p className="text-sm text-gray-600">
            Esses códigos permitem acessar sua conta se perder acesso ao 2FA ou
            ao celular autenticador. Cada código é de uso único. Guarde-os em
            local seguro.
          </p>

          {codigosStatus && (
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p>
                <strong>Total:</strong> {codigosStatus.total} •
                <strong> Usados:</strong> {codigosStatus.usados} •
                <strong> Restantes:</strong>{" "}
                <span
                  className={
                    codigosStatus.restantes <= 2
                      ? "text-red-600 font-bold"
                      : "text-green-600 font-bold"
                  }
                >
                  {codigosStatus.restantes}
                </span>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={gerarCodigosAcesso} disabled={loadingGerar}>
              {loadingGerar ? "Gerando..." : "Gerar 10 novos códigos"}
            </Button>

            {codigosGerados.length > 0 && (
              <Button variant="outline" onClick={() => setCodigosGerados([])}>
                Ocultar códigos
              </Button>
            )}
          </div>

          {codigosGerados.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-amber-800 font-medium mb-2">
                **Copie esses códigos agora! Eles não aparecem novamente.**
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {codigosGerados.map((cod, i) => (
                  <div
                    key={i}
                    className="font-mono bg-gray-100 p-3 text-center rounded border border-gray-300"
                  >
                    {cod}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FormPrivacidadeSeguranca;
