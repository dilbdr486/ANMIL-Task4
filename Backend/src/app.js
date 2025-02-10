import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import session from "express-session";
import jwt from "jsonwebtoken";
import { User } from "./models/userModel.js";
import { generateAccessAndRefereshTokens } from "./controllers/userController.js";

const app = express();

app.use(
  session({
    secret: "secretcode",
    resave: false,
  })
);

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    // origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        // Check if the user already exists using Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If the user doesn't exist, create a new one
          user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos ? profile.photos[0].value : null, // Use Google profile avatar
            password: null, // No password needed for OAuth users
            fullname: profile.displayName, // Optional: Use `profile.name` or `displayName`
          });

          // Save the new user in the database
          await user.save();
        }

        // Return the user object for session
        return cb(null, user);
      } catch (err) {
        return cb(err, null); // Handle any error during the process
      }
    }
  )
);

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

app.get("/", (req, res) => {
  res.send("<a href='/auth/google'>Login with Google</a>");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    const user = req.user;

    try {
      // Generate JWT tokens after successful login
      const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

      // Set JWT tokens as cookies (httpOnly, secure in production)
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        maxAge: 3600000, // 1 hour expiry
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        maxAge: 86400000, // 1 day expiry
      });

      // Redirect to frontend with tokens
      res.redirect(`http://localhost:5173/?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    } catch (err) {
      console.error("Error generating tokens:", err);
      res.redirect("/"); // Handle failure gracefully
    }
  }
);


app.get("/profile", (req, res) => {
  res.send(`Hello ${req.user.displayName}`);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// import routes
import userRoutes from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";

// api routes
app.use("/api/v1", userRoutes);
app.use("/api/v1/cart", cartRouter);

export { app };
