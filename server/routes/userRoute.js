const express = require('express');
const router=express.Router();
const userController=require('../controllers/userController');
const authController=require('../controllers/authController');
router.post('/sign-up',authController.signUp);
router.post('/login',authController.login)
router.post('/forgotPassword',authController.forgotPassword);
router.post('/resetPassword/:normalCryptoToken',authController.resetPassword)
router.get('/my-profile',authController.myProfile)
//for front-end filters
router.get('/authors',userController.getAllAuthors)
//middleware that protects below routes
router.use(authController.protect)

router.patch('/updatePassword',authController.updatePassword);
router.patch('/updateBio',userController.updateBio)
router.delete('/deleteMe',userController.deleteMe);


router.route('/').get(authController.restrictTo('admin'),userController.getAllUsers).post(authController.restrictTo('admin'),userController.createUser);
router.route('/:id').get(userController.getUser).patch(authController.restrictTo('admin'),userController.updateUser).delete(authController.restrictTo('admin'),userController.deleteUser);

module.exports=router;