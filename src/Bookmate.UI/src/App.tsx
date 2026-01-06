import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./Componants/Navbar";
import Home from "./Pages/Home";
import AddBook from "./Pages/AddBook";
import Wishlist from "./Pages/Wishlist";
import Welcome from "./Pages/frontpage";
import Login from "./Componants/login";
import Signup from "./Componants/signup";

// Define User type
export interface User {
  email: string;
  id: string;
}

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  // const token = localStorage.getItem("token");
  // return token ? children : <Navigate to="/login" />;
  return children;
};

// Wrapper component to use useNavigate inside App
const AppWrapper: React.FC = () => {
  const navigate = useNavigate();

  // setUser now expects a User object
  const setUser = (user: User) => {
    localStorage.setItem("token", user.id); // store user id or token
    // Optional: store full user object
    // localStorage.setItem("user", JSON.stringify(user));
  };

  // Navigation functions for switching pages
  const switchToSignup = () => navigate("/signup");
  const switchToLogin = () => navigate("/login");

  return (
    <Routes>
      {/* Welcome page */}
      <Route path="/" element={<Welcome />} />

      {/* Login & Signup pages */}
      <Route path="/login" element={<Login setUser={setUser} switchToSignup={switchToSignup} />} />
      <Route path="/signup" element={<Signup setUser={setUser} switchToLogin={switchToLogin} />} />

      {/* Protected book pages */}
      <Route
        path="/books/english"
        element={
          <PrivateRoute>
            <>
              <Navbar />
              <Home language="english" />
            </>
          </PrivateRoute>
        }
      />
      <Route
        path="/books/marathi"
        element={
          <PrivateRoute>
            <>
              <Navbar />
              <Home language="marathi" />
            </>
          </PrivateRoute>
        }
      />
      <Route
        path="/add"
        element={
          <PrivateRoute>
            <>
              <Navbar />
              <AddBook />
            </>
          </PrivateRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <PrivateRoute>
            <>
              <Navbar />
              <Wishlist />
            </>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

// App component with Router
const App: React.FC = () => {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
};

export default App;
