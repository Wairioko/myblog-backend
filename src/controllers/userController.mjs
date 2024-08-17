import { UserModel } from "../models/userSchema.mjs";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { jwtSecret } from "../../index.mjs";

export const userCreation = async (req, res) => {
    const { username, email, password } = req.body;
    if(!username || !email || !password){
        return res.status(400).send({message:"Please Fill The Missing User Detail(s)"})
    }
    try{
        const hashed_password = await bcrypt.hash(password, 10);
        const newUser = new UserModel({username, email, password:hashed_password});
        await newUser.save();
        const token = jwt.sign({id: newUser._id, username: user.username}, jwtSecret, {expiresIn: '1h'});
        console.log("User SignUp successful")
        res.status(201).json({token, message:"User SignUp Successful"})
    }catch(error){
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            const duplicateKey = Object.keys(error.keyValue)[0];
            const duplicateValue = error.keyValue[duplicateKey];
            return res.status(400).json({ message: `The ${duplicateKey} "${duplicateValue}" is already taken` });
        }
        console.log(error.message)
        res.status(500).send({message:"Error creating new user"});
    }
}


export const userLogin = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) return res.status(401).send({message: "Missing Required Fields"});
    
    try {
        const findUser = await UserModel.findOne({email});
        if (!findUser) return res.status(404).send({message: "Could not find this user"});
        
        if (!findUser.password) return res.status(500).send({message: "User data is corrupted"});
        
        const passwordVerification = await bcrypt.compare(password, findUser.password);
        if (!passwordVerification) {
            return res.status(401).send({message: "Password does not match. Try again"});
        }
        
        const token = jwt.sign({id: findUser._id, username: findUser.username}, jwtSecret, {expiresIn: '1h'});
        
        res.status(201).json({token, message: "User Login Successful"});

    } catch (error) {
        console.log(error);
        res.status(500).send({message: "Unable to Login at this time"});
    }
}