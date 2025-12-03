import { Navigate } from "react-router-dom";
import { getCurrentUser, getToken, isTokenExpired } from "../utils/auth";

const ProtectedRoute = ({ children, requireVerification = false }) => {
  const user = getCurrentUser();
  const token = getToken();
  
  // No token or user - redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Token expired - clear storage and redirect
  if (isTokenExpired()) {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("currentUser");
    return <Navigate to="/login" replace />;
  }
  
  // Check if verification is required but user not verified
  if (requireVerification && !user.verified) {
    // You could redirect to a "please verify" page, or back to login
    return <Navigate to="/login" replace state={{ 
      message: "Please verify your email first" 
    }} />;
  }
  
  // Check if verification has expired (using verificationExpiresAt from user object)
  if (requireVerification && user.verificationExpiresAt) {
    const expiryDate = new Date(user.verificationExpiresAt);
    const now = new Date();
    
    if (expiryDate <= now) {
      return <Navigate to="/login" replace state={{ 
        message: "Your verification has expired. Please verify again." 
      }} />;
    }
  }
  
  // All checks passed - render the protected component
  return children;
};

export default ProtectedRoute;