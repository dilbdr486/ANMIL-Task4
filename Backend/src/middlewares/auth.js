import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/userModel.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        console.log("Token received:", token);  // Add logging to debug token
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        const decodedToken = jwt.verify(token, process.env.GENERATE_ACCESS_TOKEN_SECRET);
        console.log("Decoded Token:", decodedToken);  // Log decoded token for debugging
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);  // Log error details
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
