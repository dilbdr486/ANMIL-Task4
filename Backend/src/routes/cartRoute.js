import express from "express";
import {
  addTOCart,
  removeFromCart,
  getCart,
} from "../controllers/cartController.js";
import { verifyJWT } from "../middlewares/auth.js";

const cartRouter = express.Router();

// cartRouter.post("/add", verifyJWT, addTOCart);
cartRouter.route('/add').post(verifyJWT, addTOCart);
cartRouter.post("/remove", verifyJWT, removeFromCart);
cartRouter.post("/get", verifyJWT, getCart);

export default cartRouter;