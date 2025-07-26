import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home.jsx'
import VehicleTypePage from './components/VehicleTypePage';
import AuthForm from './pages/Auth.jsx';
import VehicleDetails from './pages/VehicleDetails.jsx';
import AboutUs from './pages/AboutUs.jsx';
import ContactUs from './components/HomePage/ContactUs.jsx';
import Vehicle from './pages/Vehicles.jsx';
import VehiclesBrowsePage from './components/HomePage/VehiclesBrowsePage.jsx';
import ContentFilteringDemo from './pages/ContentFilteringDemo.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentFailure from './pages/PaymentFailure.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { Toaster } from 'react-hot-toast';
import ProfileSidebar from './components/ProfileSidebar.jsx';
import Layout from './components/Layout.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import BookingHistoryPage from './pages/BookingHistoryPage.jsx';
import Logout from './pages/Api/Logout.jsx';
import { UserProvider } from "./context/UserContext.jsx"
import { ProfileSidebarProvider, useProfileSidebar } from "./context/ProfileSidebarContext.jsx"
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

import Map from "./utils/map.jsx"

import FAQPage from './components/HomePage/FAQPage.jsx';
import AddVehiclePage from './pages/renter/AddVehiclePage.jsx';

function AppContent() {
  const { isProfileSidebarOpen, closeProfileSidebar } = useProfileSidebar();

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Routes with Layout (Navbar + Footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="vehicles/:type" element={<VehicleTypePage />} />
          <Route path="vehicle/:type/:id" element={<VehicleDetails />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="add-vehicle" element={<AddVehiclePage/>} />
          <Route path="payment" element={<PaymentPage/>} />
          <Route path="payment/esewa/success" element={<PaymentSuccess/>} />
          <Route path="payment/failure" element={<PaymentFailure/>} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="browse" element={<Vehicle />} />
          <Route path="vehicles" element={<VehiclesBrowsePage />} />
          <Route path="content-filtering-demo" element={<ContentFilteringDemo />} />
          <Route path="favorites" element={<FavoritesPage />} />

          <Route path="booking-history" element={<BookingHistoryPage />} />
          <Route path="host-dashboard" element={<HostDashboard />} />

          <Route path="map" element={<Map/>} />
        </Route>
        
        {/* Routes without Layout (Admin and Auth pages) */}
        <Route path="/login" element={<AuthForm />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/logout" element={<Logout/>} />
      </Routes>

      {/* Global ProfileSidebar */}
      <ProfileSidebar 
        isOpen={isProfileSidebarOpen} 
        onClose={closeProfileSidebar} 
      />
    </Router>
  );
}


export default function App() {
  return (
    <UserProvider>
      <ProfileSidebarProvider>
        {/* Global toast container */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: '',
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#363636',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            // Default options for specific types
            success: {
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#00000',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ffffff',
                color: '#000000',
              },
            },
          }}
        />
        
        <AppContent />
      </ProfileSidebarProvider>
    </UserProvider>
  )
}
