import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EstablishmentProvider } from "./contexts/EstablishmentContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Assets from "./pages/Assets";
import Dashboard2 from "./pages/Dashboard2";
import CompanyUpdate from "./pages/CompanyUpdate";
import Departments from "./pages/Departments";
import Gates from "./pages/Gates";
import Mappings from "./pages/Mappings";
import Notifications from "./pages/Notifications";
import Connections from "./pages/Connections";
import MyQRCode from "./pages/MyQRCode";

import NotificationUser from "./pages/NotificationUser";
import SubscriptionUser from "./pages/SubscriptionUser";
import SubscripEnt from "./pages/SubscripEnt";
import VisEntDashboard from "./pages/VisEntDashboard";
import VisGateEntry from "./pages/VisGateEntry";
import GeoRadarDemo from "./pages/GeoRadarDemo";
import CreateEstablishment from "./pages/createestablishment";
import Subscriptions from "./pages/subscriptions";
import "./index.css";
import AssetDebug from "./pages/AssetDebug";

function App() {
  return (
    <AuthProvider>
      <EstablishmentProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/create-establishment"
              element={
                <RequireAuth>
                  <CreateEstablishment />
                </RequireAuth>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <RequireAuth>
                  <Subscriptions />
                </RequireAuth>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Layout>
                    <Outlet />
                  </Layout>
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="qrcode" element={<MyQRCode />} />
              <Route path="profile" element={<Profile />} />
              <Route path="assets" element={<Assets />} />
              <Route path="notificationuser" element={<NotificationUser />} />
              <Route path="connections" element={<Connections />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="visentdashboard" element={<VisEntDashboard />} />
              <Route path="visgateentry" element={<VisGateEntry />} />
              <Route path="georadar-demo" element={<GeoRadarDemo />} />
              <Route path="subscription" element={<SubscriptionUser />} />
            </Route>
            {/* Debug route for SidePanel */}
            <Route
              path="/dashboard2"
              element={
                <RequireAuth>
                  <Dashboard2 />
                </RequireAuth>
              }
            >
              <Route path="plans" element={<SubscripEnt />} />
              <Route path="company-update" element={<CompanyUpdate />} />
              <Route path="departments" element={<Departments />} />
              <Route path="gates" element={<Gates />} />
              <Route path="mappings" element={<Mappings />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            <Route path="/assetdebug" element={<AssetDebug />} />
          </Routes>
        </Router>
      </EstablishmentProvider>
    </AuthProvider>
  );
}

export default App;
