const express = require('express');
const router=express.Router();
const blogPostController=require('../controllers/blogPostController');
const authController = require("../controllers/authController");
const reviewRouter=require('../routes/reviewRoute')
router.use('/:blogId/reviews',reviewRouter)
router.get('/trending',blogPostController.getTrending)
router.route("/").get(blogPostController.getAllBlogs).post(authController.protect,authController.restrictTo('admin','author'),blogPostController.createBlog);
router.route("/:id").get(blogPostController.getBlog).patch(authController.protect,authController.restrictTo('admin','author'),blogPostController.updateBlog).delete(authController.protect,authController.restrictTo('admin','author'),blogPostController.deleteBlog);
module.exports=router