import express from 'express';
import { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.mjs';
import { verifyToken } from '../auth/auth.mjs';


const router = express.Router();

router.get('/api/blogs', getAllBlogs);

router.get('/api/blog/:id', getBlogById);

router.post('/api/create-blog', createBlog);

router.put('/api/update-blog/:id',  updateBlog);

router.delete('/api/delete-blog/:id',  deleteBlog);
// verifyToken,

export default router;





