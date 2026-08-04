const express = require("express");
const router = express.Router();

const mailSender = require("../utils/mailer.js");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware.js");

router.post(
  "/contact",
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    const { name, email, phone, category, message } = req.body;

    const emailBody = `
New Contact Form Submission:
----------------------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Inquiry Type: ${category}

Message:
${message}
    `;

    const mailConfig = {
      from: email,
      to: "junaid0808alam@gmail.com",
      replyTo: email,
      subject: `[Quickplot Inquiry] Message from ${name}`,
      text: emailBody,
    };

    mailSender.sendMail(mailConfig, (err, result) => {
      if (err) {
        console.error(err);
        req.flash("error", "Try again after sometime!");
        return next(err);
      }

      req.flash("success", "Our team will get back to you shortly!");
      res.redirect("/quickplots");
    });
  }),
);

module.exports = router;
