import { useState, useEffect } from "react";
import "./AccountSettings.css";
import { getCurrentUser, logoutUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function AccountSettingsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  // Simulate fetching user data
  useEffect(() => {
    const current = getCurrentUser();
    console.log("Loaded user:", current);
    if (!current) {
      navigate("/login");
      return;
    }
    
    // Fetch user info from backend
    fetch(`http://localhost:5000/api/users/${current._id}`)
      .then((res) => res.json())
      .then((data) => setForm(data))
      .catch((err) => console.error("Error fetching user:", err));
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async(e) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${form._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      alert("Account information updated successfully!");
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
        {/* NAME */}
        <div className="form-group">
          <label>Name</label>
          <input
            name="Name"
            value={form.name}
            onChange={handleChange}
            type="text"
          />
        </div>

        {/* EMAIL (READ-ONLY) */}
        <div className="form-group">
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            type="email"
            readOnly
            className="readonly"
          />
          <small>Email cannot be changed.</small>
        </div>

        {/* PASSWORD */}
        <div className="form-group">
          <label>Password</label>
          <button type="button" className="change-password-btn">
            Change Password
          </button>
        </div>

        {/* GRAD YEAR */}
        <div className="form-group">
          <label>Graduation Year</label>
          <input
            name="gradYear"
            type="number"
            value={form.gradYear}
            onChange={handleChange}
          />
        </div>

        {/* GRAD MONTH */}
        <div className="form-group">
          <label>Graduation Month</label>
          <select
            name="gradMonth"
            value={form.gradMonth}
            onChange={handleChange}
          >
            <option value="">Select Month</option>
            {[
              "January","February","March","April","May","June",
              "July","August","September","October","November","December",
            ].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
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