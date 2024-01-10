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
import { nanoid } from "nanoid";

dotenv.config();

const { User } = model;
const { SECRET_JWT, BASE_URL } = process.env;

const avatarsDir = path.resolve("public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw helpers.HttpError(409, "Email in use");
  }

  const createHashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: createHashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify your email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click to verify email</a>`,
  };

  await helpers.sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw helpers.HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.status(200).json("Verification successful");
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw helpers.HttpError(400, "Missing required field email");
  }
  if (user.verify) {
    throw helpers.HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify your email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Click to verify email</a>`,
  };

  await helpers.sendEmail(verifyEmail);

  res.status(200).json({ message: "Verification email sent" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw helpers.HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw helpers.HttpError(401, "Email is not verified");
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
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
  }
  const { _id } = req.user;
  const { path: oldPath, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const newPath = path.join(avatarsDir, filename);
  await rename(oldPath, newPath);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  // Jimp.read(resultUpload)
  //   .then((avatar) => {
  //     return avatar.resize(250, 250).writeAsync(resultUpload);
  //   })
  //   .then(() => {
  //     res.json({ avatarURL });
  //   });

  const avatar = await Jimp.read(newPath);
  avatar.resize(250, 250).writeAsync(newPath);

  res.json({
    avatarURL,
  });
  // console.log(avatarURL);

  // console.log(req.body);
  // console.log(req.file);
  // console.log(req.user);
};

export default {
  register: decorators.ctrlWrapper(register),
  verifyEmail: decorators.ctrlWrapper(verifyEmail),
  resendVerification: decorators.ctrlWrapper(resendVerification),
  login: decorators.ctrlWrapper(login),
  getCurrent: decorators.ctrlWrapper(getCurrent),
  logout: decorators.ctrlWrapper(logout),
  updateSubscription: decorators.ctrlWrapper(updateSubscription),
  updateAvatar: decorators.ctrlWrapper(updateAvatar),
};
