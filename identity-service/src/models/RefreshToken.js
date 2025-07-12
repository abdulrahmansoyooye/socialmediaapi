import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    token:{
        type:String,
        required:true,
        unique:true
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    expiresAt:{
        type:String,
        required:true,
    }
}, {timestamps:true});

refreshTokenSchema.index({expiresAt:1},{expireAfterSeconds:0})

const RefreshToken = mongoose.model("RefreshToken",refreshTokenSchema)

export default RefreshToken