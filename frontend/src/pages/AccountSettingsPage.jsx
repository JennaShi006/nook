import { useState, useEffect } from "react";
import "../style/AccountSettings.css";
import { getCurrentUser, logoutUser } from "../utils/auth";
import { useNavigate, useLocation } from "react-router-dom";

function AccountSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(null);

  const params = new URLSearchParams(location.search);
  const userIdParam = params.get("userId");
  const tokenParam = params.get("token");
  const current = getCurrentUser();
  console.log("Current user in AccountSettingsPage:", current);

  useEffect(() => {
  const current = getCurrentUser();
    

    if (tokenParam) {
      localStorage.setItem("jwtToken", tokenParam);
    }

    // Determine which ID to fetch
    const idToFetch = userIdParam || current?._id;

    if (!idToFetch || idToFetch.length !== 24) {
      navigate("/login");
      return;
    }
    
  //   // Fetch user info from backend
  //   fetch(`http://localhost:5001/api/users/${current._id}`)
  //     .then((res) => res.json())
  //     .then((data) => setForm(data))
  //     .catch((err) => console.error("Error fetching user:", err));
  // }, [navigate]);

    fetch(`http://localhost:5000/api/users/${idToFetch}`, {
      headers: {
        Authorization: tokenParam
          ? `Bearer ${tokenParam}`
          : localStorage.getItem("jwtToken") // use saved token if exists
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched user data:", data);
        setForm(data);

        // Save to localStorage for future sessions
        localStorage.setItem("currentUser", JSON.stringify(data));
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        alert("Could not load user data");
        navigate("/login");
      });
  }, [navigate, userIdParam, tokenParam]);

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
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      alert("Account information updated successfully!");
      localStorage.setItem("currentUser", JSON.stringify(data));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem("jwtToken");
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