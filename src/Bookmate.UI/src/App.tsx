import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Componants/Navbar";
import Home from "./Pages/Home";
import AddBook from "./Pages/AddBook";
import Wishlist from "./Pages/Wishlist";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddBook />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </Router>
  );
}

export default App;