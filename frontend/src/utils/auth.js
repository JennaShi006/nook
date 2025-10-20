// Save user to localStorage
export function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// Get user from localStorage
export function getCurrentUser() {
  const stored = localStorage.getItem("currentUser");
  return stored ? JSON.parse(stored) : null;
}

// Logout user
export function logoutUser() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("jwtToken");
}

// Save JWT token separately if needed
export function setToken(token) {
  localStorage.setItem("jwtToken", token);
}

export function getToken() {
  return localStorage.getItem("jwtToken");
}
