const mongoose = require("mongoose");
const Blog = require("./blogPostModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty..."],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Rating can not be empty..."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    blog: {
      type: mongoose.Types.ObjectId,
      ref: "BlogPost",
      required: [true, "Review must belong to a Blog."],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a User"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


reviewSchema.index({blog:1,user:1},{unique:true});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo designation",
  })
  next();
});

reviewSchema.statics.calcAverageRating = async function (blogId) {
    console.log(blogId)
  const stats = await this.aggregate([
    {
      $match: { blog: new mongoose.Types.ObjectId(blogId) },
    },
    {
      $group: {
        _id: null,
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats)
  if (stats.length > 0) {
    await Blog.findByIdAndUpdate(blogId, {
      ratingsQuantity: stats[0].nRating,
      averageRating: stats[0].avgRating
    });
  } else {
    await Blog.findByIdAndUpdate(blogId, {
      ratingsQuantity: 0,
      averageRating: 4.5
    });
  }
};


const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
