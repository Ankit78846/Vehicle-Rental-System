import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast,{ Toaster } from "react-hot-toast";
import { getApiUrl } from "../../config/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!username || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(getApiUrl("admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminName","houlers");
        
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500); // Add delay for better UX
      } else {
        toast.error(data.message || "Login failed. Please try again."); 
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("Cannot connect to server. Please check your connection.");
    }
  };

  const handleLogout =()=>{
   const adminOn= localStorage.getItem("adminLoggedIn");
   if(!adminOn){
     toast.error("You are not logged in");
   } else{
     localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminToken");
    toast.success("Logged out successfully");
   }
   
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-center">Admin Login</h2>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              className="border-gray-500 rounded-xl border-2 p-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="border-2 border-gray-500 p-2 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="bg-red-600 text-white font-bold py-2 rounded-xl">
              Login
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => handleLogout()} 
              className="px-4 py-2 border-red-500 border rounded-xl hover:bg-red-500 hover:text-white transition-colors"
            > 
              Logout
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
