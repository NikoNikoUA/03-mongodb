import express from "express";
import controllers from "../../controllers/functions.js";
import mdw from "../../middlewares/index.js";
import model from "../../models/Contact.js";
import decorators from "../../decorators/index.js";

const { schemas } = model;

const router = express.Router();

// router.use(mdw.isAuthorized);

router.get("/", mdw.isAuthorized, controllers.getAll);

router.get("/:contactId", mdw.isAuthorized, mdw.isValidId, controllers.getById);

router.post(
  "/",
  // upload.fields([{name: "avatar", maxCount: 1}, {name: "subcover", maxCount: 2}])
  // upload.array("avatar", 10) - field with a few files
  mdw.upload.single("avatar"),
  mdw.isAuthorized,
  mdw.isEmptyBody,
  decorators.validateBody(schemas.addSchema),
  controllers.addContact
);

router.put(
  "/:contactId",
  mdw.isAuthorized,
  mdw.isValidId,
  mdw.isEmptyBody,
  decorators.validateBody(schemas.addSchema),
  controllers.updateContact
);

router.patch(
  "/:contactId/favorite",
  mdw.isAuthorized,
  mdw.isValidId,
  mdw.isEmptyBody,
  decorators.validateBody(schemas.addFavoriteSchema),
  controllers.updateStatusContact
);

router.delete(
  "/:contactId",
  mdw.isAuthorized,
  mdw.isValidId,
  controllers.deleteContact
);

export default router;
