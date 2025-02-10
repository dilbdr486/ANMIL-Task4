import React, { useContext, useState } from "react";
import { appContext } from "../store/appStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function login({ onLogin }) {
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [email, setEmail] = useState("");
  const [currState, setCurrState] = useState("Login");
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(appContext);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;
  
    try {
      if (currState === "Sign Up") {
        const formData = new FormData();
        formData.append("fullname", fullname);
        formData.append("email", email);
        formData.append("password", password);
        if (avatar) {
          formData.append("avatar", avatar); // Append file
        }
  
        const { data } = await axios.post(backendUrl + "/api/v1/register", formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
        });
  
        if (data.success) {

          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          setIsLoggedIn(true);
          getUserData();
          navigate("/");
        } else {
          alert(data.message);
        }
      } else {
        const { data } = await axios.post(
          backendUrl + "/api/v1/login",
          { email, password },
          { withCredentials: true }
        );
  
        if(data.success) {
          
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          setIsLoggedIn(true);
          getUserData();
          navigate("/");
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-md w-full space-y-6 sm:w-full">
        <div className="mt-2 mb-2 bg-white sm:w-full py-2 px-4 shadow-sm rounded-lg border border-neutral-200/20">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">
              {currState} in to your account
            </h2>
          </div>

          {currState === "Login" ? (
            <></>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="block w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder-gray-400"
                  placeholder="Enter your full name"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-2">
                  Avatar
                </label>
                <input
                  type="file"
                  className="block w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder-gray-400"
                  onChange={(e) => setAvatar(e.target.files[0])}
                />
              </div>
            </>
          )}

          <form
            onSubmit={onSubmitHandler}
            className="space-y-4 mt-2"
            method="POST"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                className="block w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder-gray-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="block w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none placeholder-gray-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={onLogin}
              >
                {currState === "Sign Up" ? "Create Account" : "Login"}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {/* Google Button */}
              <button className="flex justify-center items-center py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-md hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                  <path
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className="ml-2 text-gray-700 font-medium">Google</span>
              </button>

              {/* LinkedIn Button */}
              <button className="flex justify-center items-center py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-md hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200">
                <svg className="h-5 w-5 text-blue-700" viewBox="0 0 24 24">
                  <path
                    d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className="ml-2 text-gray-700 font-medium">LinkedIn</span>
              </button>
            </div>

            <div className="flex justify-start items-center gap-2 mt-1">
              <input type="checkbox" required className="h-4 w-4" />
              <p className="text-gray-500">
                By continuing, I agree to the terms of use & private
              </p>
            </div>
            {currState === "Login" ? (
              <p className="text-gray-500 text-center mt-1">
                Create a new account?{" "}
                <span
                  className="text-blue-500 hover:text-blue-600 hover:underline hover:cursor-pointer"
                  onClick={() => setCurrState("Sign Up")}
                >
                  Click here
                </span>{" "}
              </p>
            ) : (
              <p className="text-gray-500 text-center mt-1 flex gap-1 justify-center">
                Already have a account?
                <span
                  className="text-blue-500 hover:text-blue-600 hover:underline hover:cursor-pointer"
                  onClick={() => setCurrState("Login")}
                >
                  Login Here
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default login;
