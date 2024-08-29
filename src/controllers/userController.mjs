import { UserModel } from "../models/userSchema.mjs";
import bcrypt from 'bcrypt';
import jwt, { decode } from 'jsonwebtoken'
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
        const token = jwt.sign({id: newUser._id, username: newUser.username}, jwtSecret, {expiresIn: '1h'});
        console.log("User SignUp successful")
        res.status(201).send({token, message:"User SignUp Successful"})
    } catch (error) {
        res.status(500).send({ message: 'Error creating new user' });
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

        req.user = findUser;
        
        const token = jwt.sign({id: findUser._id, username: findUser.username}, jwtSecret, {expiresIn: '1h'});
        
        res.status(201).json({token, message: "User Login Successful"});

    } catch (error) {
        console.log(error);
        res.status(500).send({message: "Unable to Login at this time"});
    }
}





export const userProfile = async (req, res) => {
    let token;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (authHeader) {
        token = authHeader;
    }

    if (!token) {
        return res.status(401).json({ error: "Access denied. You are not authorized to access this resource" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = { _id: decoded.id, username: decoded.username };
        const userProfile = await UserModel.findById(req.user._id); // Use the correct reference

        if (!userProfile) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log(userProfile);
        return res.status(200).json(userProfile);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error getting profile", error: error.message });
    }
};



export const editUserProfile = async (req, res) => {
    const {username} = req.body;
    let token;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (authHeader) {
        token = authHeader;
    }

    if (!token) {
        return res.status(401).json({ error: "Access denied. You are not authorized to access this resource" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = { _id: decoded.id, username: decoded.username };
        const user = req.user;

        const updatedUser = await UserModel.findByIdAndUpdate(user._id, { 'username': username }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User profile updated successfully"});
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "Error updating user profile", error: error.message });
    }
}



