// src/utils/auth.js

export function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

export function setToken(token) {
  localStorage.setItem("jwtToken", token);
}

export function getToken() {
  return localStorage.getItem("jwtToken");
}

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("Error parsing currentUser:", err);
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("jwtToken");
};

export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  
  try {
    // Simple JWT decoding without external library
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("Invalid JWT format");
      return true;
    }
    
    // Decode the payload (middle part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    if (!payload || !payload.exp) {
      console.error("JWT payload missing expiration");
      return true;
    }
    
    // Check if token is expired (exp is in seconds)
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
    
  } catch (err) {
    console.error("Error checking token expiration:", err);
    return true;
  }
};