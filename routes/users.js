const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const expressError = require("../utils/expressError");
const router = express.Router();
const { quickplotSchema } = require("../schema.js");
const Quickplot = require("../models/sample.js");
const Signup = require("../models/signup.js");
const passport = require("passport");
const {saveRedirectUrl, isLoggedIn} = require("../middleware.js");


router.get(
  "/signup",
  wrapAsync(async (req, res) => {
    res.render("users/signup.ejs", );
  }),
);


router.get("/profile",isLoggedIn, wrapAsync(async(req,res)=> {
  const user = await Signup.findById(req.user._id);
  if(!user){
    req.flash("error", "user not find");
    return res.redirect("/quickplot");

  }
  res.render("./users/userDetails.ejs", {user})
}))

router.get("/edit", isLoggedIn, wrapAsync(async (req, res) => {
  res.render("users/editProfile.ejs", { user: req.user });
}));


router.put(
  "/:id",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { first_name, last_name, username, email_id, number, new_password } = req.body;

    // 1. Fetch the user document from MongoDB
    const user = await Signup.findById(id);

    if (!user) {
      req.flash("error", "User not found!");
      return res.redirect("/users/profile");
    }

    // 2. Update regular details
    user.first_name = first_name;
    user.last_name = last_name;
    user.username = username;
    user.email_id = email_id;
    user.number = number;

    // 3. Update password if the user provided a new one
    if (new_password && new_password.trim() !== "") {
      await user.setPassword(new_password);
    }

    // 4. Save updated user (this handles both standard fields & hashed password)
    await user.save();

    req.flash("success", "User details updated successfully!");
    res.redirect("/users/profile");
  })
);

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { first_name, last_name, number, email_id, username, password } = req.body;
    
    let newSignup = new Signup({
      first_name: first_name,
      last_name: last_name,
      number: number,
      username: username,
      email_id: email_id,
    });
    const registeredUser = await Signup.register(newSignup, password);
    
    req.login(registeredUser, (err)=> {
      if(err){
        return next(err);
      }
      req.flash("success", "user has been registered!");
      res.redirect("/quickplots");
    })
    
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("signup")
    }
  }),
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});


router.post(
  "/login",saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/users/login", 
    failureFlash: true
  }),
  wrapAsync(async (req, res) => {
    req.flash("success", "Welcome back to QuickPlot!");
    let redirectUrl = res.locals.redirectUrl || "/quickplots";
    res.redirect(redirectUrl);
  })
);

router.delete("/:id", isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params; // 1. Read ID from URL params

  // 2. Delete user from MongoDB
  await Signup.findByIdAndDelete(id);

  // 3. If the logged-in user deleted themselves, log them out
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "User account deleted successfully!");
    res.redirect("/quickplots"); // Redirect to home/dashboard route, not .ejs view
  });
}));

module.exports = router;