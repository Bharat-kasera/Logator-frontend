import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { EstablishmentProvider } from "./contexts/EstablishmentContext";
import { ToastProvider } from "./components/ToastContainer";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Assets from "./pages/Assets";
import Settings from "./pages/Settings";

import CompanyUpdate from "./pages/CompanyUpdate";
import Departments from "./pages/Departments";
import Gates from "./pages/Gates";
import Mappings from "./pages/Mappings";
import Notifications from "./pages/Notifications";
import Connections from "./pages/Connections";
import MyQRCode from "./pages/MyQRCode";
import EstablishmentList from "./components/EstablishmentList";
import EstablishmentDetails from "./components/EstablishmentDetails";

import NotificationUser from "./pages/NotificationUser";
import NotificationsPage from "./pages/NotificationsPage";
import SubscriptionUser from "./pages/SubscriptionUser";
import SubscripEnt from "./pages/SubscripEnt";
import VisEntDashboard from "./pages/VisEntDashboard";
import VisGateEntry from "./pages/VisGateEntry";
import GeoRadarDemo from "./pages/GeoRadarDemo";
import CreateEstablishment from "./pages/createestablishment";
import Subscriptions from "./pages/subscriptions";
import AssetDebug from "./pages/AssetDebug";
import "./index.css";

function App() {
  return (
    <ToastProvider>
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
              <Route path="settings" element={<Settings />} />
              <Route path="assets" element={<Assets />} />
              <Route path="establishments" element={<EstablishmentList />} />
              <Route
                path="establishments/:id"
                element={<EstablishmentDetails />}
              />
              <Route path="departments" element={<Departments />} />
              <Route path="gates" element={<Gates />} />
              <Route path="mappings" element={<Mappings />} />
              <Route path="company-update" element={<CompanyUpdate />} />
              <Route path="notificationuser" element={<NotificationUser />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="connections" element={<Connections />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="visentdashboard" element={<VisEntDashboard />} />
              <Route path="visgateentry" element={<VisGateEntry />} />
              <Route path="georadar-demo" element={<GeoRadarDemo />} />
              <Route path="subscription" element={<SubscriptionUser />} />
            </Route>



            <Route path="/assetdebug" element={<AssetDebug />} />
          </Routes>
          </Router>
        </EstablishmentProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
