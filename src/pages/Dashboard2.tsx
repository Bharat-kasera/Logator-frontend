import React from "react";
import { Outlet } from "react-router-dom";
import SidePanel2 from "../components/SidePanel2";

const Dashboard2: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex">
      {/* Side Panel */}
      <SidePanel2 />

      {/* Main Content */}
      <main className="flex-1 lg:ml-5 p-4 sm:p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard2;
