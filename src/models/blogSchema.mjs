import mongoose from "mongoose";

const blogSchema = mongoose.Schema({
    title:{
        type:String,
        required:true,
        
       
    },
    content:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
        minlength: 10,
        maxlength: 200
    },
    author:{
        type: String,
        required:true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

export const BlogModel = mongoose.model('Blog', blogSchema)

