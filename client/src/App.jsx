import React from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { Auth } from './pages/Auth';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CitizenDashboard from './pages/citizen/Dashboard';
import SubmitReport from './pages/citizen/SubmitReport';
import MyReports from './pages/citizen/MyReports';
import CitizenProfile from './pages/citizen/Profile';
import Badges from './pages/citizen/Badges';
import CollectorDashboard from './pages/swachhta-mitra/Dashboard';
import CollectorPickups from './pages/swachhta-mitra/Pickups';
import CollectorBadges from './pages/swachhta-mitra/Badges';
import AdminDashboard from './pages/admin/Dashboard';
import AdminReports from './pages/admin/Reports';
import AdminUsers from './pages/admin/Users';
import AdminSelectionPage from './pages/admin/SelectionPage';
import CitizenNotifications from './pages/citizen/Notifications';
import CollectorNotifications from './pages/swachhta-mitra/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import { useLocation } from 'react-router-dom';
import Leaderboard from './pages/Leaderboard';


import ModuleLayout from './components/layout/ModuleLayout';
import { Toaster } from 'react-hot-toast';

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = 
    location.pathname === '/login' || 
    location.pathname === '/signup' || 
    location.pathname === '/forgot-password' || 
    location.pathname.startsWith('/reset-password') || 
    location.pathname.startsWith('/citizen/') ||
    location.pathname.startsWith('/admin/') ||
    location.pathname.startsWith('/swachhta-mitra/');

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/about" element={<Home />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          
          {/* Unified Routes with ModuleLayout */}
            {/* Citizen Protected Routes */}
            <Route 
              element={
                <ProtectedRoute role="citizen">
                  <ModuleLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/citizen/report" element={<SubmitReport />} />
              <Route path="/citizen/my-reports" element={<MyReports />} />
              <Route path="/citizen/badges" element={<Badges />} />
              <Route path="/citizen/notification" element={<CitizenNotifications />} />
              <Route path="/citizen/profile" element={<CitizenProfile />} />
              <Route path="/citizen/edit-report/:id" element={<SubmitReport isEdit={true} />} />
            </Route>
            
            {/* Swachhta Mitra Protected Routes */}
            <Route 
              element={
                <ProtectedRoute role="Swachhta Mitra">
                  <ModuleLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/swachhta-mitra/dashboard" element={<CollectorDashboard />} />
              <Route path="/swachhta-mitra/pickups" element={<CollectorPickups />} />
              <Route path="/swachhta-mitra/badges" element={<CollectorBadges />} />
              <Route path="/swachhta-mitra/notification" element={<CollectorNotifications />} />
              <Route path="/swachhta-mitra/profile" element={<CitizenProfile />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute role="admin">
                  <Routes>
                    <Route path="selection" element={<AdminSelectionPage />} />
                    <Route element={<ModuleLayout />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="profile" element={<CitizenProfile />} />
                    </Route>
                  </Routes>
                </ProtectedRoute>
              } 
            />

            {/* Shared Profile Alias */}
            <Route 
              element={
                <ProtectedRoute>
                  <ModuleLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/profile" element={<CitizenProfile />} />
            </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
