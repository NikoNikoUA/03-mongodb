import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import helpers from "../helpers/index.js";
import model from "../models/User.js";

const { User } = model;

dotenv.config();

const { SECRET_JWT } = process.env;

const isAuthorized = async (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    next(helpers.HttpError(401, "Not authorized"));
  }
  try {
    const { id } = jwt.verify(token, SECRET_JWT);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      next(helpers.HttpError(401, "Not authorized"));
    }
    req.user = user;
    next();
  } catch {
    next(helpers.HttpError(401, "Not authorized"));
  }
};

export default isAuthorized;
