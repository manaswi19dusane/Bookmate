import React, { useState } from "react";

// Define the shape of the user object
interface User {
  email: string;
  id: string;
}

interface Props {
  setUser: (user: User) => void;
  switchToLogin: () => void;
}

const Signup: React.FC<Props> = ({ setUser, switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user); // update user in App
        localStorage.setItem("token", data.token); // save token
      } else {
        alert("Signup failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign Up</button>
      <p>
        Already have an account?{" "}
        <span
          onClick={switchToLogin}
          style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
        >
          Login
        </span>
      </p>
    </form>
  );
};

export default Signup;
