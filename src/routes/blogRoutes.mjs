import express from 'express';
import { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.mjs';
import { verifyToken } from '../auth/auth.mjs';


const router = express.Router();

router.get('/api/blogs', getAllBlogs);

router.get('/api/blog/:id', getBlogById);

router.post('/api/create-blog', verifyToken, createBlog);

router.put('/api/update-blog/:id',verifyToken,  updateBlog);

router.delete('/api/delete-blog/:id',verifyToken,  deleteBlog);
// verifyToken,

export default router;





