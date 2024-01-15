import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { UKR_NET_PASSWORD, UKR_NET_EMAIL } = process.env;

const nodemailerConfig = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: UKR_NET_EMAIL,
    pass: UKR_NET_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

// const email = {
//   to: "gabel45506@rentaen.com",
//   from: UKR_NET_EMAIL,
//   subject: "Hello Test",
//   html: "<p>Nice to meet you! It is working</p>",
// };

// const sendEmail = async () => {
//   try {
//     await transport.sendMail(email);
//     console.log("Email sent successfully");
//   } catch (error) {
//     console.log(error.message);
//   }
// };

const sendEmail = (data) => {
  const email = { ...data, from: UKR_NET_EMAIL };
  return transport.sendMail(email);
};

export default sendEmail;
