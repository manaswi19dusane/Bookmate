import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./Pages/Home";
import AddBook from "./Pages/AddBook";
import Wishlist from "./Pages/Wishlist";
import Login from "./Componants/login";
import Signup from "./Componants/signup";
import Layout from "./Componants/layout";
import BookDetail from "./Componants/BookDetail";


// Define User type
export interface User {
  email: string;
  id: string;
}

// PrivateRoute
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  return children;
};

const AppWrapper = () => {
  const navigate = useNavigate();

  const setUser = (user: User) => {
    localStorage.setItem("token", user.id);
  };

  const switchToSignup = () => navigate("/signup");
  const switchToLogin = () => navigate("/login");

  return (
    <Routes>
      {/* Auth pages */}
      <Route
        path="/login"
        element={<Login setUser={setUser} switchToSignup={switchToSignup} />}
      />
      <Route path="/book/:id" element={<BookDetail />} />


      <Route
        path="/signup"
        element={<Signup setUser={setUser} switchToLogin={switchToLogin} />}
      />
      

      {/* App pages */}
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
        path="/books/marathi"
        element={
          <PrivateRoute>
            <Layout>
              <Home />
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
