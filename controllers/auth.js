import bcrypt from "bcryptjs";
import decorators from "../decorators/index.js";
import model from "../models/User.js";
import helpers from "../helpers/index.js";
import jwt from "jsonwebtoken";

const { User } = model;
const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw helpers.HttpError(409, "Email in use");
  }

  const createHashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...req.body,
    password: createHashPassword,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw helpers.HttpError(401, "Email or password is wrong");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw helpers.HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  console.log(payload);

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "10h" });

  res.json({ token });
  console.log(token);
};

export default {
  register: decorators.ctrlWrapper(register),
  login: decorators.ctrlWrapper(login),
};
