import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { META_PASSWORD } = process.env;

const nodemailerConfig = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: "nikonikoua-23@meta.ua",
    pass: META_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const email = {
  to: "nibogid938@regapts.com",
  from: "nikonikoua-23@meta.ua",
  subject: "Hello Test",
  html: "<p>Nice to meet you! It is working</p>",
};

const sendEmail = async () => {
  try {
    await transport.sendMail(email);
    console.log("Email sent successfully");
  } catch (error) {
    console.log(error.message);
  }
};

export default sendEmail;
