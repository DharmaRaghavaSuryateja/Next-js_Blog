const express = require('express');
const dotenv = require("dotenv");
const path=require("path");
const cors=require('cors')
dotenv.config({path:path.join(__dirname,'config.env')});
require('./db/databaseConnection')
const appError=require('./utils/appError')
const globalErrorHandler=require('./controllers/errorController')
const app=express();
const morgan=require('morgan');
app.use(express.json());
const corsOptions = {
  origin: '*',
  methods: 'GET, POST, PATCH, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};
app.use(cors(corsOptions))
const userRouter=require('./routes/userRoute')
const blogPostRouter=require('./routes/blogPostRoute')
// const reviewRouter=require('./routes/reviewRoute');
const categoryRouter=require('./routes/categoryRoute');
app.use('/api/users',userRouter);
app.use('/api/blogs',blogPostRouter);
// app.use('/api/reviews',reviewRouter);
app.use('/api/categories',categoryRouter);
if(process.env.NODE_ENV==='development')
{
    app.use(morgan('dev'))
}
app.all('*',(req,res,next)=>{
    const error=new appError(`Requested URL ${req.originalUrl} not Found`,404);
    next(error);
 })
app.use(globalErrorHandler)
const port = process.env.PORT || 8088;
app.listen(port, () => {
  console.log("Running on " + `${port}`);
});