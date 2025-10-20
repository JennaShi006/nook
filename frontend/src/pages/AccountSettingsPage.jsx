import { useState, useEffect } from "react";
import "../style/AccountSettings.css";
import { getCurrentUser, setCurrentUser, logoutUser, setToken, getToken } from "../utils/auth";
import { useNavigate, useLocation } from "react-router-dom";

function AccountSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(null);

  // Get userId and token from query params (verification link)
  const params = new URLSearchParams(location.search);
  const userId = params.get("userId");
  const token = params.get("token");

  useEffect(() => {
    const current = getCurrentUser();
    const idToFetch = userId || current?._id;

    // If token exists in URL, store it
    if (token) {
      setToken(token);
    }

    // Redirect to login if no valid ID
    if (!idToFetch) {
      navigate("/login");
      return;
    }

    console.log("Fetching user data for ID:", idToFetch);

    fetch(`http://localhost:5000/api/users/${idToFetch}`, {
      headers: {
        Authorization: `Bearer ${token || (current && current.token)}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched user data:", data);
        setForm(data);

        // Save current user with token for session persistence
        setCurrentUser({ ...data, token: token || (current && current.token) });
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        alert("Could not load user data");
      });
  }, [navigate, userId, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${form._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      alert("Account information updated successfully!");
      setCurrentUser({ ...data, token: getToken() });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    logoutUser();
    alert("Logged out successfully!");
    navigate("/login");
  };

  if (!form) return <div style={{ padding: "120px" }}>Loading...</div>;

  return (
    <div className="account-settings">
      <h2>Account</h2>
      <form className="account-form" onSubmit={handleSave}>
        <div className="form-group">
          <label>Name</label>
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            type="text"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            value={form.email || ""}
            type="email"
            readOnly
            className="readonly"
          />
          <small>Email cannot be changed.</small>
        </div>

        <div className="form-group">
          <label>Password</label>
          <button type="button" className="change-password-btn">
            Change Password
          </button>
        </div>

        <div className="form-group">
          <label>Graduation Year</label>
          <input
            name="gradYear"
            type="number"
            value={form.gradYear || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Graduation Month</label>
          <select
            name="gradMonth"
            value={form.gradMonth || ""}
            onChange={handleChange}
          >
            <option value="">Select Month</option>
            {[
              "January","February","March","April","May","June",
              "July","August","September","October","November","December",
            ].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="save-btn-container">
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </div>

        <button onClick={handleLogout} style={{ marginTop: "20px" }}>
          Log Out
        </button>
      </form>
    </div>
  );
}

export default AccountSettingsPage;
