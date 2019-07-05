var express =require("express");
var app=express();
var port = process.env.PORT || 3000 ;
var bodyparser =require("body-parser");
var mongoose =require("mongoose");
var methodOverride=require("method-override");
app.use(methodOverride("_method"));
// mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb+srv://vinoth:vinoth9626316251@cluster0-5l3nd.mongodb.net/test?retryWrites=true&w=majority");
var passport=require("passport");
var localStrategy =require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
app.use(bodyparser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
var flash = require("connect-flash");
app.use(flash());


var User =require("./models/user")
var Campground=require("./models/campground");
var Comment =require("./models/comment");
var seedDb=require("./seed");
// seedDb()
//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"This is a dangerous place",
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
})

var commentRoutes=require("./routes/comments.js")
var campgroundRoutes=require("./routes/campgrounds.js");
var indexRoutes=require("./routes/index.js");

app.use(commentRoutes);
app.use(campgroundRoutes);
app.use(indexRoutes);


app.listen(port,function(){
    console.log("yelpcamp server has started");
})