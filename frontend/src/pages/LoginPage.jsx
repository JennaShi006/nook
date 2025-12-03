import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/LoginPage.css";
import { setCurrentUser, setToken } from "../utils/auth"; // Import your utilities

const PORT = process.env.REACT_APP_PORT || 5000;

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setNeedsVerification(false);

    try {
      const res = await fetch(`http://localhost:${PORT}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        
        if (data.needsVerification) {
          setNeedsVerification(true);
          setMessage(data.message);
        }
        return;
      }

      // Use your utility functions
      setToken(data.token);
      setCurrentUser(data.user);
      
      // Redirect to account page
      navigate(`/account?userId=${data.user._id}&token=${data.token}`);
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || "Failed to resend verification");
        return;
      }
      
      setMessage(data.message);
      setNeedsVerification(false);
    } catch (err) {
      console.error("Resend error:", err);
      setError("Failed to resend verification email");
    }
  };

  return (
    <div className="login-page" style={{ paddingTop: "120px" }}>
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
        <button type="button" className="signup" onClick={handleSignUp}>
          Create Account
        </button>
      </form>

      {needsVerification && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ color: "orange", marginBottom: "10px" }}>{message}</p>
          <button 
            onClick={handleResendVerification}
            style={{ 
              backgroundColor: "#4CAF50", 
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Resend Verification Email
          </button>
        </div>
      )}

      {!needsVerification && message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default LoginPage;