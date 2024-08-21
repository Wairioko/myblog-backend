import express from 'express';
import mongoose from 'mongoose';
import blogRoutes from './src/routes/blogRoutes.mjs';
import userRoutes from './src/routes/userRoutes.mjs';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
export const jwtSecret = process.env.jwtSecret;

const app = express();

const port = 4000;

// Database connection
mongoose.connect("mongodb://localhost:27017/my-blog")
  .then(() => console.log("Database connected successfully"))
  .catch((error) => { console.log("Error connecting to db", error.message) });

// Rate limiter
const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "Too many requests made in the last hour"
});

// CORS options
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};

app.use((req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(blogRoutes);
app.use(userRoutes);
app.use(rateLimiter);

export default app; // Export the app for testing

// If this file is run directly, start the server
if (require.main === module) {
  app.listen(port, () => console.log("Started server on port 4000"));
}
