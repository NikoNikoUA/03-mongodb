import { Schema, model } from "mongoose";
import helpers from "../helpers/index.js";
import Joi from "joi";

export const subscriptionType = ["starter", "pro", "business"];

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: subscriptionType,
      default: "starter",
    },
    token: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", helpers.handleMongooseError);
userSchema.pre("findOneAndUpdate", helpers.handleUpdateSchema);
userSchema.post("findOneAndUpdate", helpers.handleMongooseError);

const registerSchema = Joi.object({
  name: Joi.string(),
  subscription: Joi.string()
    .valid(...subscriptionType)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...subscriptionType)
    .required(),
});

const User = model("user", userSchema);

const schemas = { registerSchema, loginSchema, updateSubscriptionSchema };

export default { User, schemas };
