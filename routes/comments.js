var express=require("express");
var router=express.Router({mergeParams:true});
var Campground=require("../models/campground.js");
var Comment=require("../models/comment.js");

//NEW
router.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.render("comments/new",{campground:campground});
        }
    })
})
//CREATE
router.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    res.redirect("/campgrounds");
                }else{
                    comment.author.id=req.user._id;
                    comment.author.username=req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success","Comment added Successfully");
                    res.redirect("/campgrounds/"+req.params.id);
                }
            })
        }
    })
    
})
//EDIT
router.get("/campgrounds/:id/comments/:comment_id/edit",checkCommentOwner,function(req,res){
            Comment.findById(req.params.comment_id,function(err,foundcomment){
        if(err){
            res.redirect("/campgrounds/"+req.params.id);
        }else{
            res.render("comments/edit",{comment:foundcomment,campid:req.params.id});
        }
        })
    })
//UPDATE
router.put("/campgrounds/:id/comments/:comment_id",checkCommentOwner,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comm,function(err,updatedcomment){
        if(err){
            res.redirect("/campgrounds/"+req.params.id);
        }else{
            req.flash("success","Comment updated Successfully")
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})
//DELETE
router.delete("/campgrounds/:id/comments/:comment_id",checkCommentOwner,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("/campgrounds/"+req.params.id);
        }else{
            req.flash("success","Comment removed Successfully");
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
})
function isLoggedIn (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You have to be Logged In to do that");
    res.redirect("/login")
}

function checkCommentOwner (req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,foundcomment){
            if(foundcomment.author.id.equals(req.user._id)){
                next();
            }else{
                req.flash("error","You don't have permission to do this");
                res.redirect("back")
            }
        })
    }else{
        req.flash("error","You need to be Logged In to do that");
        res.redirect("/login")
    }
}

module.exports=router;