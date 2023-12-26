import express from "express";
import decorators from "../../decorators/index.js";
import model from "../../models/User.js";
import controllers from "../../controllers/auth.js";

const { schemas } = model;
const router = express.Router();

router.post(
  "/register",
  decorators.validateBody(schemas.registerSchema),
  controllers.register
);

router.post(
  "/login",
  decorators.validateBody(schemas.loginSchema),
  controllers.login
);

export default router;
