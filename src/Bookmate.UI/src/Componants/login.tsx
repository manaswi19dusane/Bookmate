import React, { useState } from "react";

interface User {
  email: string;
  id: string;
}

interface Props {
  setUser: (user: User) => void;
  switchToSignup: () => void;
}

const Login: React.FC<Props> = ({ setUser, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
      localStorage.setItem("token", data.token);
    } else {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      <p>
        Don't have an account? <span onClick={switchToSignup} style={{ cursor: "pointer", color: "blue" }}>Signup</span>
      </p>
    </form>
  );
};

export default Login;
