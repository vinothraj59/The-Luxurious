var express=require("express");
var router=express.Router();
var Campground=require("../models/campground.js");

//INDEX
router.get("/campgrounds",function(req,res){
    Campground.find({},function(err,allcampgs){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index",{campgrounds:allcampgs}); 
        }
    })
   
})
//NEW
router.get("/campgrounds/new",isLoggedIn,function(req,res){
    res.render("campgrounds/new");
})
//CREATE
router.post("/campgrounds",isLoggedIn,function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var description=req.body.description;
  
    var newcampground={name:name, image:image,description:description};
    Campground.create(newcampground,function(err,campground){
        if(err){
            console.log(err);
        }else{
            campground.author.id=req.user._id;
            campground.author.username=req.user.username;
            campground.save();
            req.flash("success","Posted successfully");
            res.redirect("/campgrounds") 
        }
    })
   
})

//SHOW
router.get("/campgrounds/:id",function(req,res){
    Campground.findById(req.params.id).populate("comments").exec (function(err,foundedcamp){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show",{campground:foundedcamp});
        }
    });
})
//EDIT
router.get("/campgrounds/:id/edit",checkCampgroundOwner,function(req,res){
    Campground.findById(req.params.id,function(err,foundcampground){
        if(err){
            res.redirect("/campgrounds")
        }else{
            res.render("campgrounds/edit",{campground:foundcampground});
        }
    })
})
//UPDATE
router.put("/campgrounds/:id",checkCampgroundOwner,function(req,res){
    Campground.findByIdAndUpdate(req.params.id,req.body.camp,function(err,updatedcamp){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})
//DELETE
router.delete("/campgrounds/:id",checkCampgroundOwner,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            req.flash("success","Post removed");
            res.redirect("/campgrounds");
        }
    })
})

function isLoggedIn (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be Logged In to do that");
    res.redirect("/login")
}
function checkCampgroundOwner (req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id,function(err,foundcampground){
            if(foundcampground.author.id.equals(req.user._id)){
                next();
            }else{
                req.flash("error","You don't have permission to do this");
                res.redirect("back");
            }
        })
    }else{
        req.flash("error","You need to be Logged In to do that");
        res.redirect("back");
    }
}

module.exports=router;