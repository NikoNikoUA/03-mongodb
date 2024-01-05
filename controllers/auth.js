import bcrypt from "bcryptjs";
import decorators from "../decorators/index.js";
import model from "../models/User.js";
import helpers from "../helpers/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { subscriptionType } from "../models/User.js";
import gravatar from "gravatar";
import path from "path";
import { rename } from "fs/promises";
import Jimp from "jimp";

dotenv.config();

const { User } = model;
const { SECRET_JWT } = process.env;

const avatarsDir = path.resolve("public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw helpers.HttpError(409, "Email in use");
  }

  const createHashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: createHashPassword,
    avatarURL,
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

  const token = jwt.sign(payload, SECRET_JWT, { expiresIn: "10h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).send();
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  try {
    const { subscription } = req.body;
    if (!subscriptionType.includes(subscription)) {
      throw helpers.HttpError(400, "Invalid subscription value");
    }

    const result = await User.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true }
    );
    if (!result) {
      throw helpers.HttpError(404, "User not found");
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  await rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  const avatar = await Jimp.read(resultUpload);
  avatar.resize(250, 250).write(resultUpload);

  res.json({
    avatarURL,
  });
};

export default {
  register: decorators.ctrlWrapper(register),
  login: decorators.ctrlWrapper(login),
  getCurrent: decorators.ctrlWrapper(getCurrent),
  logout: decorators.ctrlWrapper(logout),
  updateSubscription: decorators.ctrlWrapper(updateSubscription),
  updateAvatar: decorators.ctrlWrapper(updateAvatar),
};
