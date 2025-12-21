export async function BuscarCep(cep: string) {
  try {
    const cleanCep = cep.replace(/\D/g, "");

    const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);

    if (!res.ok) {
      throw new Error("Erro ao buscar CEP na BrasilAPI");
    }

    const data = await res.json();

    return {
      logradouro: data.street ?? "",
      bairro: data.neighborhood ?? "",
      cidade: data.city ?? "",
      estado: data.state ?? "",
    };
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
}
