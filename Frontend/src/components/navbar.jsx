import React, { useContext, useState, useEffect } from "react";
import { appContext } from "../store/appStore";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";

function Header() {
  const { userData, backendUrl, setUserData, setIsLoggedIn } =
    useContext(appContext);
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      setLoading(false);
    }
  }, [userData]);

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
      setUserData(null);

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Debugging: Log userData and avatar URL
  const avatarUrl = userData?.avatar?.startsWith("http")
    ? userData.avatar
    : userData?.avatar
    ? `${backendUrl}/${userData.avatar}`
    : null;

  // Debugging: Log userData and avatar URL
  console.log("User Data:", userData);
  console.log("Avatar URL:", avatarUrl);

  if (!userData) {
    return <div>Loading...</div>; 
  }
  return (
    <header className="shadow sticky z-50 top-0">
      <nav className="border-gray-200 px-4 lg:px-6 py-2.5 bg-slate-50 font-bold">
        <div className="flex justify-between items-center">
          <div>logo</div>
          <div>
            <ul className="flex justify-center gap-5 py-3">
              <li className="block py-2 pr-2 pl-2 duration-200 hover:bg-green-200 rounded-lg">
                Home
              </li>
              <li className="block py-2 pr-2 pl-2 duration-200 hover:bg-green-200 rounded-lg">
                <NavLink to='/activity'>
                Services
                </NavLink>
                </li>
              <li className="block py-2 pr-2 pl-2 duration-200 hover:bg-green-200 rounded-lg">
                About
              </li>
            </ul>
          </div>
          {userData ? (
            <div
              className="flex items-center gap-3 relative"
              onMouseEnter={() => setShowLogout(true)}
              onMouseLeave={() => setShowLogout(false)}
            >
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border border-gray-300 shadow-sm cursor-pointer"
                />
              )}
              <span className="font-medium">{userData.fullname}</span>

              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="absolute top-10 right-0 bg-red-500 text-white py-1 px-4 rounded-lg shadow-md"
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <div>
              <ul className="flex justify-center gap-5 py-3">
                <li className="block py-2 pr-2 pl-2 duration-200 hover:bg-green-200 rounded-lg">
                  <NavLink
                    to="/login"
                    className="text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    Login
                  </NavLink>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
