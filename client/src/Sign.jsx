import React, { useState } from 'react';
import './style/Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import logo from './assets/images/logo-track.png';

// Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Sign() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!name || !email || !password) {
      toast.warning("⚠️ Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Account created successfully!");
        setTimeout(() => {
          window.location.href = "/Home"; // Redirect to login
        }, 1500);
      } else {
        toast.error(`❌ ${data.message || "Registration failed."}`);
      }
    } catch (err) {
      console.error("Sign up error:", err);
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
            <h2 style={{ color: "black" }}>SIGN UP</h2>
          </div>

          <form onSubmit={handleSignUp}>
            <div className="input-info">
              <FontAwesomeIcon icon={faUser} style={{ color: "black" }} size="2x" />
              <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              <button type="submit">SIGN UP</button><br />
              <a href="/Login">Have an account?</a>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
    </div>
  );
}

export default Sign;
