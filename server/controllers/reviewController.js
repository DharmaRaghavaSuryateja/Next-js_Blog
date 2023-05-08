const asyncWrapper = require("../utils/asyncWrapper");
const appError=require('../utils/appError')
const Review=require('../models/reviewModel');
exports.getAllReviews=asyncWrapper(async (req,res,next)=>{
   const reviews=await Review.find({blog:req.params.blogId});
   res.status(201).json({
    message: "success",
    data: {
      data: reviews,
    },
  });
})
exports.createReview=asyncWrapper(async (req,res,next)=>{
    req.body.blog=req.params.blogId
    req.body.user=req.user._id
    const review=await Review.create(req.body);
    await Review.calcAverageRating(req.params.blogId)
    res.status(201).json({
        message: "success",
        data: {
          data: review,
        },
      });

})
exports.getReview=asyncWrapper(async (req,res,next)=>{
    const review=await Review.findById(req.params.id);
    res.status(201).json({
        message: "success",
        data: {
          data: review,
        },
      });
})
exports.updateReview=asyncWrapper(async (req,res,next)=>{
    const data=await Review.findById(req.params.id);
   if(!((data.user._id).equals(req.user._id)))
   {
    return next(new appError('You cannot edit others Review'));
   }
    const review=await Review.findByIdAndUpdate(req.params.id,req.body,{
        runValidators:true,
        new:true
    });
    await Review.calcAverageRating(req.params.blogId)
    res.status(201).json({
        message: "success",
        data: {
          data:review
        },
      });
    
})
exports.deleteReview=asyncWrapper(async (req,res,next)=>{
    const data=await Review.findById(req.params.id);
    if(data.user._id!==req.user._id)
    {
     return next(new appError('You cannot delete others Review'));
    }
    const review=await Review.findByIdAndDelete(req.params.id);
    await Review.calcAverageRating(req.params.blogId)
    res.status(204).json({
        message: "success",
        data: {
          data: null,
        },
      });
})