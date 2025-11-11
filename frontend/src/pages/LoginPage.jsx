import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/LoginPage.css";

const PORT = process.env.REACT_APP_PORT || 5000;

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = () => {
      navigate("/signup");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(`http://localhost:${PORT}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      setMessage("Verification link sent! Please check your email.");
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
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
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
        <button className="signup" onClick={handleSignUp}>
            Create Account
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
  // return <SignUpPage/>;
}

export default LoginPage;