import React, { useContext } from "react";
import { appContext } from "../store/appStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const { backendUrl, setIsLoggedIn } = useContext(appContext);
  const navigate = useNavigate();
  const {userData} = useContext(appContext)

  
  

  const handleLogout = async () => {
    try {
      // Send logout request to backend
      await axios.post(
        `${backendUrl}/api/v1/logout`,
        {},
        { withCredentials: true }
      );

      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Update login state
      setIsLoggedIn(false);

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-100 p-6">
      {/* Card Container */}
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-gray-800">
        Hey  {userData? userData.fullname:"Developer"}👋
        </h1>
        <h2 className="text-3xl font-bold text-blue-600 mt-2">
          Welcome to Our App
        </h2>
      </div>
    </div>
  );
}

export default Home;
