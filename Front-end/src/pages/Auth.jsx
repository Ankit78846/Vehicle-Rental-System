import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { auth, provider, signInWithPopup } from "../../src/firebase";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import toast,{Toaster} from "react-hot-toast"
// Create axios instance with credentials enabled for cookies
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  withCredentials: true, // This is crucial for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

export default function AuthForm() {
  const { setUser } = useUserContext();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/check');
      if (response.data.authenticated) {
        setIsAuthenticated(true);
        navigate('/'); // Redirect to dashboard if already logged in
      }
    } catch (error) {
      console.log('Not authenticated ', error);
      setIsAuthenticated(false);
    }
  };

 const handleGoogleLogin = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      api.post("/auth/google", {
        name: user.displayName,
        email: user.email,
        googleId: user.uid,
        imgUrl: user.photoURL,
      })
        .then((response) => {
          const { user: userData, token } = response.data;

          // Validate response data
          if (!userData || !token) {
            toast.error("Invalid response from server. Please try again.");
            return;
          }

          console.log(userData);
          const { imgUrl, email, name, id } = userData;

          // Safely store user data in localStorage
          try {
            localStorage.setItem("token", token);
            localStorage.setItem("profileImg", imgUrl || "");
            localStorage.setItem("name", name || "");
            localStorage.setItem("email", email || "");
            localStorage.setItem("userId", id || "");
            
            // Dispatch event to update navbar profile image
            window.dispatchEvent(new Event('profileImageUpdated'));
          } catch (storageError) {
            console.error("localStorage error:", storageError);
            toast.error("Error saving user data. Please try again.");
            return;
          }
          
          setIsAuthenticated(true);
          toast.success("Google login successful! Welcome!");
          setTimeout(() => navigate("/"), 1500);
        })
        .catch((error) => {
          console.error("Google Sign-In API Error:", error);
          if (error.response?.status === 401) {
            toast.error("Google authentication failed. Please try again.");
          } else if (error.response?.status === 409) {
            toast.error("Account already exists. Please login with your email and password.");
          } else if (error.response?.data?.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("Google sign-in failed. Please try again or use email login.");
          }
        });
    })
    .catch((error) => {
      console.error("Google Sign-In Popup Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Google sign-in was cancelled");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("Popup was blocked. Please allow popups and try again");
      } else {
        toast.error("Google sign-in failed. Please try again.");
      }
    });
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (isLogin) {
      // Validate login fields
      if (!form.email || !form.password) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (!form.email.includes("@") || !form.email.includes(".")) {
        toast.error("Please enter a valid email address");
        setLoading(false);
        return;
      }

      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      console.log("Login response:", response.data); // Debug log
      const { user: userData, token } = response.data;
      
      // Validate response data
      if (!userData || !token) {
        console.error("Invalid response structure:", response.data);
        toast.error("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      setUser(userData);
      
      // Safely store user data in localStorage
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("profileImg", userData?.imgUrl || "");
        localStorage.setItem("name", userData?.name || "");
        localStorage.setItem("email", userData?.email || "");
        localStorage.setItem("userId", userData?.id || "");
        
        // Dispatch event to update navbar profile image
        window.dispatchEvent(new Event('profileImageUpdated'));
      } catch (storageError) {
        console.error("localStorage error:", storageError);
        toast.error("Error saving user data. Please try again.");
        setLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      toast.success("Login successful! Welcome back!");
      setTimeout(() => navigate("/"), 1500); // delay redirect
    } else {
      // Validate signup fields
      if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (!form.email.includes("@") || !form.email.includes(".")) {
        toast.error("Please enter a valid email address");
        setLoading(false);
        return;
      }

      if (form.name.length < 2) {
        toast.error("Name must be at least 2 characters long");
        setLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      const response = await api.post("/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      console.log("Signup response:", response.data); // Debug log
      const { user: userData, token } = response.data;
      
      // Validate response data
      if (!userData || !token) {
        console.error("Invalid response structure:", response.data);
        toast.error("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      setUser(userData);
      
      // Safely store user data in localStorage
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("profileImg", userData?.imgUrl || "");
        localStorage.setItem("name", userData?.name || "");
        localStorage.setItem("email", userData?.email || "");
        localStorage.setItem("userId", userData?.id || "");
        
        // Dispatch event to update navbar profile image
        window.dispatchEvent(new Event('profileImageUpdated'));
      } catch (storageError) {
        console.error("localStorage error:", storageError);
        toast.error("Error saving user data. Please try again.");
        setLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      toast.success("Account created successfully! Welcome to EasyWheels!");
      setTimeout(() => navigate("/"), 1500); // delay redirect
    }
  } catch (error) {
    console.error("Auth error:", error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      if (isLogin) {
        toast.error("Invalid email or password. Please check your credentials.");
      } else {
        toast.error("Account creation failed. Please try again.");
      }
    } else if (error.response?.status === 409) {
      toast.error("An account with this email already exists. Please login instead.");
    } else if (error.response?.status === 400) {
      const message = error.response?.data?.message;
      if (message?.includes("password")) {
        toast.error("Password requirements not met. Please use a stronger password.");
      } else if (message?.includes("email")) {
        toast.error("Please enter a valid email address.");
      } else {
        toast.error(message || "Invalid input. Please check your information.");
      }
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.code === "ERR_NETWORK") {
      toast.error("Cannot connect to server. Please check your internet connection.");
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please try again.");
    } else {
      toast.error(isLogin ? "Login failed. Please try again." : "Signup failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('profileImg');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
      setIsAuthenticated(false);
      toast.success("Logged out successfully");
      navigate('/');
      setUser("")
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error logging out. Please try again.");
    }
  };

  // If user is already authenticated, show logout option
  if (isAuthenticated) {
    return (<>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            You are already logged in
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <div className="flex items-center justify-between px-6 py-4 absolute top-0 left-0 w-full z-10">
        <div className="absolute top-0 left-6 z-20">
          <img
            src="blacklogo.png"
            alt="EasyWheels Logo"
            className="w-20 h-auto"
          />
        </div>

        <div className="absolute top-11 right-12 z-20 flex items-center gap-4">
          <button className="text-gray-600 hover:text-red-500 transition">
            <FiPhone size={30} />
          </button>
          <button className="text-green-500 hover:text-green-600 transition">
            <FaWhatsapp size={30} />
          </button>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 w-full max-w-md sm:w-[90%] mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mt-3">
            {isLogin ? "Welcome Back" : "Let's Start Driving"}
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Please login or sign up to continue
          </p>

          {/* Login form */}
          {isLogin ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-gray-700">
                Your Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
                required
              />

              <label className="block text-sm font-medium text-gray-700 mt-4">
                Your Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors mb-6 mt-6 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            /* Signup form */
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-gray-700 m-0">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
                required
              />

              <label className="block text-sm font-medium text-gray-700 m-0">
                Your Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
                required
              />

              <label className="block text-sm font-medium text-gray-700 m-0">
                Your Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
                required
              />

              <label className="block text-sm font-medium text-gray-700 m-0">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-type password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:outline-none"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors mb-6 disabled:opacity-50"
              >
                {loading ? "Signing up..." : "Signup"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-red-500 hover:underline font-medium"
            >
              {isLogin ? "Register now" : "Login here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}