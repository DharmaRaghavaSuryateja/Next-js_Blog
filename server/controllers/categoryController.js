const asyncWrapper = require("../utils/asyncWrapper");
const Category=require('../models/categoryModel');
exports.getAllCategories=asyncWrapper(async (req,res,next)=>{
  let query=Category.find();
  if(req.query.select)
  {
    let obj=req.query.select.split(',').join(' ');
     query=query.select(obj)
  }
   const categories=await query;
   res.status(201).json({
    message: "success",
    data: {
      data: categories,
    },
  });

})
exports.createCategory=asyncWrapper(async (req,res,next)=>{
    const category=await Category.create(req.body);
   res.status(201).json({
    message: "success",
    data: {
      data: category,
    },
  });
})