require("dotenv").config();
const nodemailer = require("nodemailer");

const mailSender = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = mailSender;