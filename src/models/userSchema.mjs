import mongoose from "mongoose";
import validator from "validator";

const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength: 3,
        maxlength: 20
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate: {
            validator: (v) => validator.isEmail(v),
            message: props => `${props.value} is not a valid email!`
        }
    },
    password:{
        type:String,
        required:true
    }
})


export const UserModel = mongoose.model('User', userSchema);
