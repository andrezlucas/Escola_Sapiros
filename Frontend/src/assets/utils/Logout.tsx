import { authFetch } from "./authFetch";

async function logout() {
  const token = localStorage.getItem("token");

  try {
    await authFetch("http://localhost:3000/auth/logout", {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  } catch {
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    window.location.href = "/";
  }
}

export default logout;
