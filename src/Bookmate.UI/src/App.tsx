import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Componants/Navbar";
import Home from "./Pages/Home";
import AddBook from "./Pages/AddBook";
import Wishlist from "./Pages/Wishlist";
import Welcome from "./Pages/frontpage";  // ⬅️ NEW

function App() {
  return (
    <Router>

      {/* Show Navbar only AFTER selecting language */}
      <Routes>
        {/* WELCOME PAGE FIRST (no navbar here) */}
        <Route path="/" element={<Welcome />} />

        {/* AFTER selecting language, show navbar + books */}
        <Route
          path="/books/english"
          element={
            <>
              <Navbar />
              <Home language="english" />
            </>
          }
        />

        <Route
          path="/books/marathi"
          element={
            <>
              <Navbar />
              <Home language="marathi" />
            </>
          }
        />

        {/* Other existing pages also need Navbar */}
        <Route
          path="/add"
          element={
            <>
              <Navbar />
              <AddBook />
            </>
          }
        />

        <Route
          path="/wishlist"
          element={
            <>
              <Navbar />
              <Wishlist />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
