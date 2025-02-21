import React, { useContext, useState, useEffect } from "react";
import { appContext } from "../store/appStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [email, setEmail] = useState("");
  const [currState, setCurrState] = useState("Login");
  const [passwordError, setPasswordError] = useState("");
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(appContext);
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Password strength regex
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const onGoogleHandler = () => {
    window.location.href = `${backendUrl}/auth/google`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");
    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      setIsLoggedIn(true);
      getUserData();
      navigate("/");
    }
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoginError(""); // Clear previous errors

    if (!termsAccepted) {
      alert("You must agree to the terms and conditions.");
      return;
    }

    // Validate password strength
    if (!strongPasswordRegex.test(password)) {
      setPasswordError(
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character."
      );
      return;
    } else {
      setPasswordError(""); // Clear the error if password is valid
    }

    axios.defaults.withCredentials = true;

    try {
      if (currState === "Login") {
        const { data } = await axios.post(
          backendUrl + "/api/v1/login",
          { email, password },
          { withCredentials: true }
        );

        if (data.success) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          setIsLoggedIn(true);
          getUserData();
          navigate("/");
        } else {
          setLoginError(data.message || "Invalid email or password.");
        }
      } else {
        const { data } = await axios.post(
          backendUrl + "/api/v1/signup",
          { fullname, email, password, avatar },
          { withCredentials: true }
        );

        if (data.success) {
          setCurrState("Login");
          alert("Account created successfully. Please log in.");
        } else {
          setLoginError(data.message || "User already exists.");
        }
      }
    } catch (error) {
      console.error("Request failed:", error);
      if (error.response && error.response.status === 401) {
        setLoginError("Invalid email or password.");
      } else if (error.response && error.response.status === 403) {
        setLoginError(
          error.response.data.message ||
            "Account is locked for 5 minutes. Try again later."
        );
      } else if (error.response && error.response.status === 404) {
        setLoginError("User not found or does not exist.");
      } else {
        setLoginError("An error occurred. Please try again later.");
      }
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
                  required
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
                  required
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
                required
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
                required
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
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
            {loginError && (
              <p className="text-red-500 text-sm mt-2">{loginError}</p>
            )}
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

            <div className="mt-6 w-full">
              {/* Google Button */}
              <button
                className="flex justify-center w-full items-center py-3 px-4 border border-gray-300 bg-white rounded-lg shadow-md hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                onClick={onGoogleHandler}
              >
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                  <path
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className="ml-2 text-gray-700 font-medium">Google</span>
              </button>
            </div>

            <div className="flex justify-start items-center gap-2 mt-1">
              <input
                type="checkbox"
                className="h-4 w-4"
                required
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
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

export default Login;
