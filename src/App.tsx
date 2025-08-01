import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { EstablishmentProvider } from "./contexts/EstablishmentContext";
import { DataProvider } from "./contexts/DataContext";
import { ToastProvider } from "./components/ToastContainer";
import DataLoader from "./components/DataLoader";
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
import Mappings from "./pages/Mappings";

import Connections from "./pages/Connections";
import MyQRCode from "./pages/MyQRCode";
import EstablishmentDetails from "./components/EstablishmentDetails";

import NotificationUser from "./pages/NotificationUser";
import NotificationsPage from "./pages/NotificationsPage";


import VisEntDashboard from "./pages/VisEntDashboard";
import VisGateEntry from "./pages/VisGateEntry";
import GeoRadarDemo from "./pages/GeoRadarDemo";
import CompanyList from "./pages/CompanyList";
import CreateCompany from "./pages/CreateCompany";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyEstablishments from "./pages/CompanyEstablishments";
import CompanyAnalytics from "./pages/CompanyAnalytics";
import CompanyVisitors from "./pages/CompanyVisitors";
import CompanyRequests from "./pages/CompanyRequests";
import CompanySettings from "./pages/CompanySettings";
import Subscriptions from "./pages/subscriptions";
import AssetDebug from "./pages/AssetDebug";
import EstablishmentsRedirect from "./pages/EstablishmentsRedirect";
import DepartmentsRedirect from "./pages/DepartmentsRedirect";
import GatesRedirect from "./pages/GatesRedirect";
import "./index.css";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <CompanyProvider>
            <EstablishmentProvider>
              <DataLoader>
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
                  <EstablishmentsRedirect />
                </RequireAuth>
              }
            />
            <Route
              path="/create-company"
              element={
                <RequireAuth>
                  <CreateCompany />
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
              <Route path="companies" element={<CompanyList />} />
              <Route path="establishments" element={<EstablishmentsRedirect />} />
              <Route
                path="establishments/:id"
                element={<EstablishmentDetails />}
              />
              <Route path="departments" element={<DepartmentsRedirect />} />
              <Route path="gates" element={<GatesRedirect />} />
              <Route path="mappings" element={<Mappings />} />
              <Route path="company-update" element={<CompanyUpdate />} />
              <Route path="notificationuser" element={<NotificationUser />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="connections" element={<Connections />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="visentdashboard" element={<VisEntDashboard />} />
              <Route path="visgateentry" element={<VisGateEntry />} />
              <Route path="georadar-demo" element={<GeoRadarDemo />} />
              <Route path="subscription" element={<Navigate to="/subscriptions" replace />} />
            </Route>



            {/* Company-specific routes */}
            <Route path="/company/:companyId/dashboard" element={<RequireAuth><CompanyDashboard /></RequireAuth>} />
            <Route path="/company/:companyId/establishments" element={<RequireAuth><CompanyEstablishments /></RequireAuth>} />
            <Route path="/company/:companyId/analytics" element={<RequireAuth><CompanyAnalytics /></RequireAuth>} />
            <Route path="/company/:companyId/visitors" element={<RequireAuth><CompanyVisitors /></RequireAuth>} />
            <Route path="/company/:companyId/requests" element={<RequireAuth><CompanyRequests /></RequireAuth>} />
            <Route path="/company/:companyId/settings" element={<RequireAuth><CompanySettings /></RequireAuth>} />

            <Route path="/assetdebug" element={<AssetDebug />} />
          </Routes>
                </Router>
              </DataLoader>
            </EstablishmentProvider>
          </CompanyProvider>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
