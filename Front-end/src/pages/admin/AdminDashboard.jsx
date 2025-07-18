import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UsersDataComponent from "./DashboardComponent/UsersDataComponent.jsx";
import VehicleDataComponent from './DashboardComponent/VehicleDataComponent.jsx';
import AddVehicleForm from '../renter/AddVehicleForm.jsx';
import EditVehicleForm from './DashboardComponent/EditVehiclePage.jsx'; // Reusable Add/Edit form

const Sidebar = ({ selectedMenu, setSelectedMenu }) => {
  const menuItems = [
    { id: 'vehicles', name: 'Vehicle Listing' },
    { id: 'users', name: 'Users' },
    { id: 'add-vehicle', name: 'Add Vehicle' },
    {id: "vehicle-booking", name:"Vehicle Booking"},
  ];

  return (
    <div className="w-64 bg-blue-400 text-white h-screen fixed top-0 left-0">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Admin Dashboard
      </div>
      <nav className="mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full text-left p-4 hover:bg-gray-700 transition-colors ${
              selectedMenu === item.id ? 'bg-gray-700' : ''
            }`}
            onClick={() => setSelectedMenu(item.id)}
          >
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

const VehicleListing = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Vehicle Listing</h2>
    <div className="bg-white p-4 rounded-lg shadow">
          <VehicleDataComponent/>

    </div>
  </div>
);

const Users = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Users</h2>
          <p className="text-gray-600 mb-4">User details will be displayed here</p>

    <div className="bg-white p-4 rounded-lg shadow">
       <UsersDataComponent />
      
    </div>
  </div>
);

const AddVehicle = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Add Vehicle</h2>
    <div className="bg-white p-4 rounded-lg shadow">
     <EditVehicleForm />
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const isAdmin = localStorage.getItem('adminLoggedIn');
    if (!isAdmin) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const [selectedMenu, setSelectedMenu] = useState('vehicles');


  const renderContent = () => {
    switch (selectedMenu) {
      case 'vehicles':
        return <VehicleListing  />;
      case 'users':
        return <Users />;
      case 'add-vehicle':
        return <AddVehicle  />;
      default:
        return <VehicleListing  />;
    }
  };

  return (
    <div className="flex">
      <Sidebar selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
      <div className="flex-1 ml-64 bg-gray-100 min-h-screen">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
