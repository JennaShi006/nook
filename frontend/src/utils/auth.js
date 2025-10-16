export function getCurrentUser() {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
}

export function logoutUser() {
  localStorage.removeItem("user");
}