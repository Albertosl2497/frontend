import React, { useState } from "react";
import "./login.css";
import Logo from "../Assets/logo.png";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

function LoginPage({ setIsLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid credentials");
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        toast.success("Logged in successfully!");
      })
      .catch((error) => {
        // handle login error
        toast.error("Invalid credentials");
        setPassword("");
        setUsername("");
        console.error(error);
      });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-container">
          <div className="row" style={{ gap: 5 }}>
            <img src={Logo} alt="Logo" />
            <div className="col">
              <h1>SORTEOS </h1>
              <h1>SONORENSE</h1>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
