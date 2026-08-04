const Quickplot = require("./models/sample")

module.exports.isLoggedIn = (req,res,next)=> {
    if(!req.isAuthenticated()){
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", "you must be logged-in first.");
      return  res.redirect("/users/login")
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=> {
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner = async(req,res,next)=>{
  let {id} = req.params;
  let quickplot = await Quickplot.findById(id);
    if(!quickplot.owner.equals(res.locals.currUser._id)){
      req.flash("error", "you don't have permission as you are not owner.")
      return res.redirect(`/quickplots/${id}`);
      }
    next();
}
