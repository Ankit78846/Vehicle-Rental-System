import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home.jsx'
import VehicleTypePage from './components/VehicleTypePage';
import AuthForm from './pages/Auth.jsx';
import VehicleDetails from './pages/VehicleDetails.jsx';
import Profile from './pages/Profile.jsx';
import AboutUs from './pages/AboutUs.jsx';
import ContactUs from './pages/ContactUs.jsx';
import Vehicle from './pages/Vehicles.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { Toaster } from 'react-hot-toast';

import Logout from './pages/Api/logout.jsx';
import { UserProvider } from "./context/UserContext.jsx"
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

import FAQPage from './pages/FAQPage.jsx';
import AddVehiclePage from './pages/renter/AddVehiclePage.jsx';


export default function App() {

  return (

    <UserProvider>
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

      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthForm />} />
          <Route path="/vehicles/:type" element={<VehicleTypePage />} />
          <Route path="/vehicle/:type/:id" element={<VehicleDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/add-vehicle" element={<AddVehiclePage/>} />
          <Route path="/payment" element={<PaymentPage/>} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/browse" element={<Vehicle />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/logout" element={<Logout/>} />
          {/* Fallback route for 404 */}


        </Routes>
      </Router>

    </UserProvider>
  )
}
