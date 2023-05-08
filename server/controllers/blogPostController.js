const asyncWrapper = require("../utils/asyncWrapper");
const BlogPost = require("../models/blogPostModel");
const features = require("../utils/apiFeatures");
const url = require('url');

exports.getTrending=asyncWrapper(async (req, res, next) => {
  const blogs=await BlogPost.find().sort({averageRating:-1}).limit(4);
  res.status(201).json({
    message: "success",
    data: {
      data: blogs,
    },
  });
})

exports.getAllBlogs = asyncWrapper(async (req, res, next) => {

  let query1 = new features(BlogPost.find(), req.query)
    .filter()
    .sort()
    .limitFields().
    search().author().category();
    let query2= new features(BlogPost.find(), req.query)
    .filter()
    .sort()
    .limitFields().
    search().author().category().paginate();
    let count=await query1.mongooseQuery.count();
    let Blogs = await query2.mongooseQuery;
    let pageCount;
    if(req.query.limit)
    {
      pageCount=Math.ceil(count/req.query.limit);
    }
    else{
      pageCount=Math.ceil(count/10);
    }
  const queryObject = url.parse(req.url, true).query;
  res.status(201).json({
    message: "success",
    data: {
      data: Blogs,
      pageCount,
      queryObject
      
    },
  });
});

exports.createBlog = asyncWrapper(async (req, res, next) => {
  const Blog = await BlogPost.create(req.body);
  res.status(201).json({
    message: "success",
    data: {
      data: Blog,
    },
  });
});
exports.getBlog = asyncWrapper(async (req, res, next) => {
    const blog=await BlogPost.findById(req.params.id)
    res.status(201).json({
        message: "success",
        data: {
          data: blog,
        },
      });

});
exports.updateBlog = asyncWrapper(async (req, res, next) => {
    const blog=await BlogPost.findById(req.params.id)
    const {title,description,image,isPublished,publishedDate}=req.body;
    blog.title=title
    blog.description=description
    blog.image=image
    blog.isPublished=isPublished
    blog.publishedDate=publishedDate
    const blogData=await blog.save();
    res.status(201).json({
        message: "success",
        data: {
          data: blogData,
        },
      });

});
exports.deleteBlog = asyncWrapper(async (req, res, next) => {
    const blog=await BlogPost.findByIdAndDelete(req.params.id)
    res.status(204).json({
        message: "success",
        data: {
          data:null
        },
      });
});
