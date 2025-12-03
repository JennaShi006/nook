import { useState } from "react";
import "../style/SignupPage.css"
const PORT = process.env.REACT_APP_PORT || 5000;

function SignupPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        gradYear: "",
        gradMonth: "",
        userType: "",
        adminCode: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If user selected Admin, require an admin code
        if (form.userType === "admin" && !form.adminCode.trim()) {
            alert("Admin sign-up requires an admin code.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:${PORT}/api/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                // Show error if backend returns 400 or 500
                alert(`Signup failed: ${data.message || "Please fill all required fields correctly."}`);
                console.error("Signup error:", data);
                return;
            }

            console.log("Signup response:", data);
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            alert("Signup successful! Check console for response.");
        } catch (err) {
            console.error("Error:", err);
            alert("Network or server error. Please try again.");
        }
    };

    return (
        <div className = "signup" style={{ padding: "2rem" }}>
            <h2>Sign Up</h2>
          
            <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Full Name" onChange={handleChange} required /><br/>
            <input name="email" placeholder="Email" onChange={handleChange} required /><br/>
            <input name="username" placeholder="Username" onChange={handleChange} required /><br/>
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required /><br/>
            <input type="number" name="gradYear" placeholder="Graduation Year" onChange={handleChange} required /><br/>
            <select name="gradMonth" onChange={handleChange} required>
                <option value="">Select Month</option>
                {[
                    "January","February","March","April","May","June",
                    "July","August","September","October","November","December"
                ].map(m => <option key={m} value={m}>{m}</option>)}
            </select><br/>
            <select name="userType" onChange={handleChange} value={form.userType} required>
                <option value="">Select User Type</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
            </select><br/>
            {form.userType === "admin" && (
                <>
                    <input
                        name="adminCode"
                        placeholder="Admin code"
                        value={form.adminCode}
                        onChange={handleChange}
                        required
                    /><br/>
                </>
            )}
            <button type="submit">Sign Up</button>
        </form>
    </div>
  );
}

export default SignupPage;
