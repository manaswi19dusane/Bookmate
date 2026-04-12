import { useState, cloneElement, isValidElement } from "react";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import Chatbot from "./ChatBot/Chatbot";
type SearchInjectedChild = React.ReactElement<{ searchQuery?: string }>;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="layout">
        <Sidebar onOpenChat={() => setChatOpen(true)} />
        <div className="main-content">
          {isValidElement(children)
            ? cloneElement(children as SearchInjectedChild, { searchQuery })
            : children}
        </div>
      </div>
      {chatOpen && (
        <Chatbot
          open={chatOpen}
          onOpen={() => setChatOpen(true)}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
};

export default Layout;
