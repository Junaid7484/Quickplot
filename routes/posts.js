const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const expressError = require("../utils/expressError");
const Quickplot = require("../models/sample.js");
const Signup = require("../models/signup.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// 1. DASHBOARD
// router.get(
//   "/",
//   wrapAsync(async (req, res) => {
//     const counter = await Quickplot.countDocuments();
//     const totalUser = await Signup.countDocuments();
//     const quickplots = await Quickplot.find().limit(4);
//     res.render("dashboard.ejs", { quickplots, counter, totalUser });
//   })
// );

// 2. INFO / ABOUT
router.get(
  "/info",
  wrapAsync(async (req, res) => {
    res.render("quickplotgo.ejs");
  })
);

// 3. ALL POSTS
router.get(
  "/post",
  wrapAsync(async (req, res) => {
    let quickplots = await Quickplot.find();
    res.render("quickplot.ejs", { quickplots });
  })
);

// 4.
router.get("/myposts", isLoggedIn, wrapAsync(async(req,res)=> {
 let quickplots = await Quickplot.find({ owner: req.user._id });
    res.render("quickplot.ejs", { quickplots });
  })
)


// 4. NEW PROPERTY FORM
router.get(
  "/new",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    res.render("new.ejs");
  })
);

// 5. CONTACT
router.get(
  "/contact",
  wrapAsync(async (req, res) => {
    res.render("getintouch.ejs");
  })
);

// 6. LOGOUT
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/quickplots");
  });
});

// 7. EDIT PROPERTY FORM
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let quickplot = await Quickplot.findById(id);

    if (!quickplot) {
      req.flash("error", "Property does not exist!");
      return res.redirect("/quickplots");
    }

    res.render("edit.ejs", { quickplot });
  })
);

// 8. SHOW, PUT (UPDATE), AND DELETE ROUTES
router
  .route("/:id")
  .get(
    wrapAsync(async (req, res, next) => {
      const quickplot = await Quickplot.findById(req.params.id).populate(
        "owner"
      );

      if (!quickplot) {
        req.flash("error", "Property does not exist!");
        return res.redirect("/quickplots");
      }

      res.render("show.ejs", { quickplot });
    })
  )
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"), // Parses form data and file upload
    wrapAsync(async (req, res, next) => {
      let { id } = req.params;
      let { title, contact, price, location, name } = req.body;

      // Update basic fields
      let quickplot = await Quickplot.findByIdAndUpdate(
        id,
        { title, contact, price, location, name },
        { new: true }
      );

      // Re-geocode if location is provided
      if (location) {
        let response = await geocodingClient
          .forwardGeocode({
            query: location,
            limit: 1,
          })
          .send();
        if (response.body.features && response.body.features.length) {
          quickplot.geometry = response.body.features[0].geometry;
        }
      }

      // If a new image file was uploaded, update Cloudinary details
      if (req.file) {
        const url = req.file.path;
        const filename = req.file.filename;
        quickplot.image = { url, filename };
      }

      await quickplot.save();

      req.flash("success", "Listed property updated successfully!");
      res.redirect(`/quickplots/${id}`);
    })
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {
      let { id } = req.params;
      await Quickplot.findByIdAndDelete(id);
      req.flash("success", "Listed property deleted successfully!");
      res.redirect("/quickplots/post");
    })
  );

// 9. CREATE PROPERTY
router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  wrapAsync(async (req, res, next) => {
    let { title, contact, price, location, name } = req.body;
    let response = await geocodingClient
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();

    const url = req.file.path;
    const filename = req.file.filename;

    let newPost = new Quickplot({
      title,
      contact,
      name,
      price,
      location,
      image: { url, filename },
      owner: req.user._id,
    });

    if (response.body.features && response.body.features.length) {
      newPost.geometry = response.body.features[0].geometry;
    }

    await newPost.save();

    req.flash("success", "New property added successfully!");
    res.redirect("/quickplots");
  })
);

module.exports = router;