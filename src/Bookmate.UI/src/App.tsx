import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import Home from "./Pages/Home";
import AddBook from "./Pages/AddBook";
import Wishlist from "./Pages/Wishlist";
import Layout from "./Componants/layout";
import BookDetail from "./Componants/BookDetail";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Preferences from "./Pages/Preferences";
import Interactions from "./Pages/Interactions";
import { User } from "./Api/auth";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

const AppWrapper = () => {
  const navigate = useNavigate();

  const setUser = (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onAuthSuccess={setUser} />} />
      <Route path="/register" element={<Register onAuthSuccess={setUser} />} />
      <Route path="/signup" element={<Register onAuthSuccess={setUser} />} />

      <Route
        path="/book/:id"
        element={
          <PrivateRoute>
            <Layout>
              <BookDetail />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Home />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/preferences"
        element={
          <PrivateRoute>
            <Layout>
              <Preferences />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/interactions"
        element={
          <PrivateRoute>
            <Layout>
              <Interactions />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/add"
        element={
          <PrivateRoute>
            <Layout>
              <AddBook />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <PrivateRoute>
            <Layout>
              <Wishlist />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
};

export default App;