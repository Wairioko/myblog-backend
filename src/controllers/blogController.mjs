import { BlogModel } from "../models/blogSchema.mjs";
import { Storage } from "@google-cloud/storage";
import multer from "multer";



const storage = new Storage();
const bucketName = "myblogimages";
const bucket = storage.bucket(bucketName);

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
});


const uploadBlogImage = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject("No file chosen for upload");
        }

        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
        });

        blobStream.on('error', (err) => {
            console.error("Stream error:", err); // Log more detailed error information
            reject(err);
        });

        blobStream.on('finish', () => {
            const publicUrl =  `https://storage.googleapis.com/${bucketName}/${blob.name}`;
            resolve(publicUrl);
        });

        blobStream.end(file.buffer);
    });
}
export const createBlog = async (req, res) => {
    const { title, description, content } = req.body;
    const user = req.user;
    const files = req.files;

    if (!title || !description || !content) {
        return res.status(400).send({ message: "Missing required field(s)" });
    }
    if (!user || !user.username) {
        return res.status(401).send({ message: "User not authenticated or username not available" });
    }

    try {
        const existingTitle = await BlogModel.findOne({ title });
        
        if (existingTitle) {
            return res.status(409).send({ message: "This title is already taken. Please choose another one." });
        }

        let imageUrls = [];
        if (files && files.length > 0) {
            for (let file of files) {
                const imageUrl = await uploadBlogImage(file);
                imageUrls.push(imageUrl);
                console.log("Image URL:", imageUrl);
            }
        }

        const newBlog = new BlogModel({ 
            title, 
            description, 
            content, 
            author: user.username, 
            imageUrls
        });
        await newBlog.save();

        res.status(201).send({ message: "Blog Created Successfully", blog: newBlog });
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).send({ message: "Error creating Blog" });
    }
}


// function to get all blogs
export const getAllBlogs = async (req, res) => {
    const blogs = await BlogModel.find();
    if (!blogs) return res.status(404).send({message: "No blogs found"});
    res.status(200).send(blogs);
}


export const updateBlog = async (req, res) => {
    const { title, description, content, imageUrls } = req.body;
    const { id } = req.params;
    const files = req.files;

    try {
        let updatedImageUrls = imageUrls ? JSON.parse(imageUrls) : [];

        if (files && files.length > 0) {
            for (let file of files) {
                const imageUrl = await uploadBlogImage(file);
                updatedImageUrls.push(imageUrl);
            }
        }

        const updateData = { 
            title, 
            description, 
            content, 
            imageUrls: updatedImageUrls
        };

        const updatedBlog = await BlogModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            return res.status(404).send({ message: "Blog not found" });
        }

        res.status(200).send({ message: "Blog Updated Successfully", blog: updatedBlog });
    } catch (error) {
        console.error("Error updating blog:", error);
        if (error.name === 'CastError') {
            return res.status(400).send({ message: "Invalid Blog Id format" });
        }
        res.status(500).send({ message: "Error Updating Blog" });
    }
};


export const getBlogById = async(req, res) => {
    const { id } = req.params;
    try{
        const findBlog = await BlogModel.findOne({ _id: id });
        if(!findBlog) return res.status(404).send({message:"Blog not found"});
        return res.status(200).send(findBlog);

    }catch(error){
        console.log(error.message)
        res.status(500).send({message:"Error fetching Blog"})
    }
}


export const deleteBlog = async(req, res) => {
    const { id } = req.params;
    try{
        const findBlog = await BlogModel.findOneAndDelete({_id: id})
        if(!findBlog) return res.status(404).send({message:"Blog not found"});
        return res.status(200).send("Blog successfully deleted");

    }catch(error){
        console.log(error.message)
        res.status(500).send({message:"Error Deleting Blog"})
    }
}




