export async function BuscarCep(cep: string) {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) return null;

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`, {
      signal: controller.signal,
    });

    if (res.ok) {
      const data = await res.json();
      return {
        logradouro: data.street ?? "",
        bairro: data.neighborhood ?? "",
        cidade: data.city ?? "",
        estado: data.state ?? "",
      };
    }
  } catch (e) {
    console.warn("BrasilAPI falhou, tentando ViaCEP...");
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await res.json();

    if (data.erro) return null;

    return {
      logradouro: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      estado: data.uf ?? "",
    };
  } catch (e) {
    console.error("Erro total ao buscar CEP:", e);
    return null;
  }
}
