function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/";
}

export default logout;