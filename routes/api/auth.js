import express from "express";
import decorators from "../../decorators/index.js";
import model from "../../models/User.js";
import controllers from "../../controllers/auth.js";
import mdw from "../../middlewares/index.js";

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

router.get("/current", mdw.isAuthorized, controllers.getCurrent);

router.post("/logout", mdw.isAuthorized, controllers.logout);

router.patch(
  "/users",
  mdw.isAuthorized,
  decorators.validateBody(schemas.updateSubscriptionSchema),
  controllers.updateSubscription
);

export default router;
