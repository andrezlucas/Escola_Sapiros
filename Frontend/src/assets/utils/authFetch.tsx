export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const token = localStorage.getItem("token");

  const response = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "/";

    throw new Error("Sessão expirada");
  }

  return response;
}
