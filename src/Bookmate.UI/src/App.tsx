import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./Componants/layout";
import Home from "./Pages/Home";
import AddBook from "./Pages/AddBook";
import Wishlist from "./Pages/Wishlist";
import Lending from "./Pages/Lending";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Preferences from "./Pages/Preferences";
import Interactions from "./Pages/Interactions";
import Recommendations from "./Pages/Recommendations";
import Library from "./Pages/Library";
import Institution from "./Pages/Institution";
import Club from "./Pages/Club";
import Community from "./Pages/Community";
import Marketplace from "./Pages/Marketplace";
import BookDetail from "./Componants/BookDetail";
import UserGuide from "./Pages/UserGuide";

function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/guide" element={<UserGuide />} />

      {[
        { path: "/",               element: <Home /> },
        { path: "/add",            element: <AddBook /> },
        { path: "/book/:id",       element: <BookDetail /> },
        { path: "/wishlist",       element: <Wishlist /> },
        { path: "/lending",        element: <Lending /> },
        { path: "/library",        element: <Library /> },
        { path: "/marketplace",    element: <Marketplace /> },
        { path: "/preferences",    element: <Preferences /> },
        { path: "/interactions",   element: <Interactions /> },
        { path: "/recommendations",element: <Recommendations /> },
        { path: "/institution",    element: <Institution /> },
        { path: "/club",           element: <Club /> },
        { path: "/community",      element: <Community /> },
      ].map(route => (
        <Route key={route.path} path={route.path}
          element={<PrivateRoute><Layout>{route.element}</Layout></PrivateRoute>} />
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
