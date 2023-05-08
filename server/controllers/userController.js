const asyncWrapper = require("../utils/asyncWrapper");
const User = require("../models/userModel");

function filterFields(inputObj, inputArr) {
  let requiredObj = {};
  Object.keys(inputObj).map((item) => {
    if (inputArr.includes(item)) {
      requiredObj[item] = inputObj[item];
    }
  });
  return requiredObj;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
exports.getAllAuthors = asyncWrapper(async (req, res,next) => {
  let users = await User.find({role:'author'});
  res.status(200).json({
    message: "success",
    data:{
    data: users
    }
  });
});
//------------------------------------------------------------------For Admins----------------------------------------------------------------
exports.getAllUsers = asyncWrapper(async (req, res,next) => {
  let users = await User.find();
  res.status(200).json({
    message: "success",
    data:{
    data: users
    }
  });
});
exports.createUser = asyncWrapper(async (req, res, next) => {
  const user= await User.create(req.body);
  res.status(201).json({
    message: "success",
    data: {
      data: user,
    },
  });
});
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(201).json({
    message: "success",
    data: {
      data: user,
    },
  });
};
exports.updateUser = asyncWrapper(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new:true
  });
  res.status(201).json({
    message: "success",
    data: {
      data: user,
    },
  });
});
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(204).json({
    message: "success",
    data: {
      data: null,
    },
  });
};
//---------------------------------------------------------For Users------------------------------------------------------------------------------
exports.updateBio = asyncWrapper(async function (req, res, next) {
  const fields = ["name", "email","photo","designation"];
  const filterObj = filterFields(req.body, fields);
  const user = await User.findById(req.user._id, filterObj, {
    new: true,
    runValidators: true,
  });
  //this approach is :using .save instead of findByidAndUpdate...so refer book
//   const user = await User.findById(req.user._id);
//   for(let key in filterObj)
//   {
//     user[key]=filterObj[key];
//   }
//   let userx=await user.save();
  return res.status(201).json({
    message: "success",
    data: {
        data: user,
      },
  });
});

exports.deleteMe = asyncWrapper(async function (req, res, next) {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  return res.status(204).json({
    message: "success",
    data: {
        data: null,
      },
  });
});
//------------------------------------------------------------------------------------------------------------------------------------------------------
