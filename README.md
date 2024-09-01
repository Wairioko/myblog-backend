 Node.js Blog Backend Server

## Overview
This Node.js backend server allows users to create a profile, log in, and perform CRUD operations on a blog. It uses Express.js for the API routes and MongoDB as the database.

## Features
- **User Authentication:** Sign up and log in using JWT tokens.
- **CRUD Operations:** Create, read, update, and delete blog posts.
- **Profile Management:** Users can create and manage their profiles.

## Tech Stack
- **Node.js** - Backend server environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT (JSON Web Tokens)** - Authentication

## Setup Instructions

### Prerequisites
- Node.js and npm installed
- MongoDB installed and running

### Installation
1. **Clone the repository:**
   
   git clone [(https://github.com/Wairioko/myblog-backend.git)]
   cd repository-name
   
Install dependencies:
npm install


### Set up environment variables:

Create a .env file in the root directory.
Add the following variables:
JWT_SECRET=your_jwt_secret
export GOOGLE_APPLICATION_CREDENTIALS="your_google_app_credentials"


### Start Server:
npm start


### Run Tests:
npm test

### API Endpoints
## Authentication

POST /api/signup - Register a new user
POST /api/login - Log in and receive a JWT token

User Profile
GET /api/profile - Get user profile
PUT /api/edit-profile - Update user profile



###Blog
POST /api/create-blog - Create a new blog post
GET /api/blogs - Retrieve all blog posts
GET /api/blogs/:id - Retrieve a single blog post
PUT /api/update-blog/:id - Update a blog post
DELETE /api/delete-blog/:id - Delete a blog post



Contributing
Contributions are welcome! Please fork this repository and submit a pull request with your changes.

License
This project is licensed under the MIT License.

Contact
For any queries or issues, reach out to [charlesmungai5@gmail.com].
