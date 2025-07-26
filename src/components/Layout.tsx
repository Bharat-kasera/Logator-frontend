import React from "react";
import SidePanel from "./SidePanel";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex">
      {/* Side Panel */}
      <SidePanel />

      {/* Main Content */}
      <main className="flex-1 mt-10 lg:mt-0 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout;
