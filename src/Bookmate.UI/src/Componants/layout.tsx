// Import React hooks + helpers
import { useState, cloneElement, ReactElement } from "react";

// Import components
import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import Chatbot from "./ChatBot/Chatbot";

// Define type for children props injection
type ChildProps = {
  searchQuery?: string;
};

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {

  // 🔹 State for chatbot open/close
  const [chatOpen, setChatOpen] = useState(false);

  // 🔹 GLOBAL Search State
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {/* 🔵 NAVBAR */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 🔵 MAIN LAYOUT */}
      <div className="layout">

        <Sidebar onOpenChat={() => setChatOpen(true)} />

        <div className="main-content">

          {/* ✅ SAFE CLONE ELEMENT */}
          {children &&
            cloneElement(children as ReactElement<ChildProps>, {
              searchQuery,
            })}
        </div>
      </div>

      {/* 🔵 CHATBOT */}
      {chatOpen && (
        <Chatbot onClose={() => setChatOpen(false)} />
      )}
    </>
  );
};

export default Layout;
