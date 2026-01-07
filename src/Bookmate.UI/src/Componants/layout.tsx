import Navbar from "./Navbar";
import Sidebar from "./sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="layout">
        <Sidebar />
        <div className="main-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
