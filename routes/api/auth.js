import express from "express";
import decorators from "../../decorators/index.js";
import model from "../../models/User.js";
import controllers from "../../controllers/auth.js";
import mdw from "../../middlewares/index.js";

const { schemas } = model;
const authRouter = express.Router();

authRouter.post(
  "/register",
  decorators.validateBody(schemas.registerSchema),
  controllers.register
);

authRouter.post(
  "/login",
  decorators.validateBody(schemas.loginSchema),
  controllers.login
);

authRouter.get("/current", mdw.isAuthorized, controllers.getCurrent);

authRouter.post("/logout", mdw.isAuthorized, controllers.logout);

authRouter.patch(
  "/users",
  mdw.isAuthorized,
  decorators.validateBody(schemas.updateSubscriptionSchema),
  controllers.updateSubscription
);

authRouter.patch(
  "/avatars",
  mdw.isAuthorized,
  mdw.upload.single("avatar"),
  controllers.updateAvatar
);

export default authRouter;
