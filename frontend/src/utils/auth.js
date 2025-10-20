export function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function getCurrentUser() {
  const stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
}

export function logoutUser() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("jwtToken");
}
export function setToken(token) {
  localStorage.setItem("jwtToken", token);
}

export function getToken() {
  return localStorage.getItem("jwtToken");
}
