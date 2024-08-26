import { BlogModel } from "../models/blogSchema.mjs";

// function to get all blogs created

export const getAllBlogs = async (req, res) => {
    const blogs = await BlogModel.find();
    if(!blogs) return res.status(404).send({message:"No blogs found"})
    res.status(200).send(blogs)
}


export const createBlog = async (req, res) => {
    const { title, description, content } = req.body;
    const user = req.user;

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

        const newBlog = new BlogModel({ title, description, content, author: user.username });
        await newBlog.save();

        res.status(201).send({ message: "Blog Created Successfully", blog: newBlog });
    } catch (error) {

        res.status(500).send({ message: "Error creating Blog" });
    }
}

export const updateBlog = async (req, res) => {
    const { title, description, content } = req.body;
    const { id } = req.params;
    
    try {
        // Remove the parseInt, as MongoDB expects a string ID
        const updatedBlog = await BlogModel.findByIdAndUpdate(
            id, 
            { title, description, content },
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
}


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




