import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./sidebar";
import Chatbot from "./ChatBot/Chatbot";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Navbar />
      <Chatbot
        open={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
      />

      <div className="layout">
        <Sidebar onOpenChat={() => setChatOpen(true)} />
        <div className="main-content">{children}</div>
      </div>
    </>
  );
};

export default Layout;
