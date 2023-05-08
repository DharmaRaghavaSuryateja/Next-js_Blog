const mongoose = require("mongoose");

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A blog must have a title"],
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "A Blog must have a author"],
    },
    description: {
      type: String,
      required: [true, "A Blog must have a description"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/300x200.png?text=No+Image",
    },
    averageRating: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
blogPostSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "blog",
  localField: "_id",
});
blogPostSchema.pre(/^find/, function (next) {
  this.populate({
    path: "author",
    select: "name photo email designation ",
  }).populate({
    path: "category",
    select: "name",
  }).populate({
    path:'reviews'
  });
  next();
});

// blogPostSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({
//     $lookup: {
//       from: "users",
//       localField: "author",
//       foreignField: "_id",
//       as: "author",
//     }
//   }, {
//     $lookup: {
//       from: "categories",
//       localField: "category",
//       foreignField: "_id",
//       as: "category",
//     }
//   });
//   next();
// });
module.exports = mongoose.model("BlogPost", blogPostSchema);
