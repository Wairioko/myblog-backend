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
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

export const BlogModel = mongoose.model('Blog', blogSchema)

