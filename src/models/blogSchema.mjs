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
       
    },
    author:{
        type: String,
        required:true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    imageUrls: {
        type: [],
    }
})

export const BlogModel = mongoose.model('Blog', blogSchema)

