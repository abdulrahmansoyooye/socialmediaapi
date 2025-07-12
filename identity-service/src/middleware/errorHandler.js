import logger from "../utils/logger.js"

const errorHandler = (err,req,res,next)=>{
 logger.error(err.stack);

 if(err.status || 500){
    res.status(err.status || 500).json({
        message:err.message || "Internal server error"
    })
 }
}

export const asyncHanlder = (fn) => (req,res,next)=>{
  return Promise.resolve(fn(req,res)).catch(next)
}

export default errorHandler