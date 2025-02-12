import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const appContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/v1/current-user`, {
        withCredentials: true,
      });

      if (data.success) {
        setUserData(data.data);
        console.log("User data fetched:", data.data);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Get user data failed:", error);
      setUserData(null);
    }
  };

  const getAuth = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/v1/auth`, {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedIn(true);
        getUserData();
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    console.log("User Data in Header:", userData); // Log userData whenever it changes
  }, [userData]);
  
  const avatarUrl = userData?.avatar?.startsWith("http")
    ? userData.avatar
    : userData?.avatar
    ? `${backendUrl}/${userData.avatar}`
    : null;
  
  console.log("Avatar URL:", avatarUrl);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      getAuth();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false);
    setUserData(null);
  };

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
    logout,
  };

  return <appContext.Provider value={value}>{children}</appContext.Provider>;
};
