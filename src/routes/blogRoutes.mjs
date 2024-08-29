import express from 'express';
import { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.mjs';
import { verifyToken } from '../auth/auth.mjs';
import multer from 'multer';


// Configure multer for handling file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
});




const router = express.Router();

router.get('/api/blogs', getAllBlogs);

router.get('/api/blog/:id', getBlogById);

router.post('/api/create-blog',  upload.array('images', 5) ,verifyToken, createBlog);

router.put('/api/update-blog/:id',verifyToken,  updateBlog);

router.delete('/api/delete-blog/:id',verifyToken,  deleteBlog);
// verifyToken,

export default router;





