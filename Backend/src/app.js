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
        console.log("Google profile data:", profile);

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
            password: null,
            fullname: profile.displayName,
          });

          await user.save();
        }


        return cb(null, user);
      } catch (err) {
        return cb(err, null); s
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
      const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 hour expiry
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000, // 1 day expiry
      });

      // Redirect to frontend with tokens and avatar URL
      res.redirect(`http://localhost:5173/?accessToken=${accessToken}&refreshToken=${refreshToken}&avatar=${user.avatar}`);
    } catch (err) {
      console.error("Error generating tokens:", err);
      res.redirect("/");
    }
  }
);


// app.get("/profile", (req, res) => {
//   res.send(`Hello ${req.user.displayName}`);
// });

// app.get("/logout", (req, res) => {
//   req.logout();
//   res.redirect("/");
// });

// import routes
import userRoutes from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";

// api routes
app.use("/api/v1", userRoutes);
app.use("/api/v1/cart", cartRouter);

export { app };
