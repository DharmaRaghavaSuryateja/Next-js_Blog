module.exports=(controllerFunction)=>{
    return (req,res,next)=>{
       controllerFunction(req,res,next).catch(err=>next(err));
    }
}