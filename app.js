if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");

const wrapAsync = require("./utils/wrapAsync");
const expressError = require("./utils/expressError");

let port = 8080;

const Quickplot = require("./models/sample.js");
const Signup = require("./models/signup.js");
const mongoose = require("mongoose");
const { error } = require("console");
const { quickplotSchema } = require("./schema.js");

const quickplot = require("./routes/posts.js");
const userQuickplot = require("./routes/users.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const mailSender = require("./routes/mailSender.js")
const passport = require("passport");
const LocalStrategy = require("passport-local")
const {isLoggedIn} = require("./middleware.js")

dbUrl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then((res) => {
    console.log("database is connected...");
  })
  .catch((err) => console.log(err));




app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static("public"));

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE:", err);
});

const sessionOptions = {
  store,
  secret:process.env.SECRET ,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Signup.authenticate()));

passport.serializeUser(Signup.serializeUser());
passport.deserializeUser(Signup.deserializeUser());

app.use((req,res,next)=> {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

app.use("/quickplots", quickplot);
app.use("/quickplots", mailSender);
app.use("/users", userQuickplot);



app.use((err, req, res, next) => {
  let { status = 400, message = "something went wrong..." } = err;
  res.render("error.ejs", { message });
});

app.get("/",(req,res)=> {
  res.render("root.ejs")
})


app.listen(port,()=> {
  console.log(`server is running on port ${port}`);
  
})
