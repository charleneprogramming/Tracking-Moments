import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import logo from './assets/images/logo-track.png';

// Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔹 Prevent logged-in users from going back to Login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/Home"); // redirect immediately if token exists
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.warning("⚠️ Please fill in both fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Login successful!");
        // Save token and user data from response
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          navigate("/Home");
        }, 1500);
      } else {
        toast.error(`❌ ${data.message || "Login failed."}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("🚨 Something went wrong. Please try again.");
    }
  };

  return (
    <div className="cover">
      <div className="title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '12px', paddingLeft: '15px' }}>
          <img src={logo} alt="Logo" style={{ height: '40px' }} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Tracking Moments</h1>
        </div>
      </div>

      <div className="border">
        <div className="border-title">
          <div className="login">
            <h2 style={{ color: "black" }}>LOGIN</h2>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-info">
              <FontAwesomeIcon icon={faEnvelope} style={{ color: "black" }} size="2x" />
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-info">
              <FontAwesomeIcon icon={faLock} style={{ color: "black" }} size="2x" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="submit">
              <button type="submit">LOGIN</button><br />
              <a href="/Sign">Create Account?</a>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
    </div>
  );
}

export default Login;
