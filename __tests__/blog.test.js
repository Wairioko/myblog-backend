import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../src/controllers/blogController.mjs"
import { BlogModel } from "../src/models/blogSchema.mjs";
import mongoose from "mongoose";


jest.mock('../src/models/blogSchema')



// Mock the response object
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };
  
  describe('getAllBlogs', () => {
    let req, res;
  
    beforeEach(() => {
      req = {};
      res = mockResponse();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return all blogs with status 200 when blogs are found', async () => {
      const mockBlogs = [
        { title: 'Blog 1',description:"desi1" ,content: 'Content 1' },
        { title: 'Blog 2',description: "desi2" ,content: 'Content 2' },
      ];
  
      BlogModel.find = jest.fn().mockResolvedValue(mockBlogs);
  
      await getAllBlogs(req, res);
  
      expect(BlogModel.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockBlogs);
    });
  
    it('should return 404 status with message when no blogs are found', async () => {
      BlogModel.find = jest.fn().mockResolvedValue(null);
  
      await getAllBlogs(req, res);
  
      expect(BlogModel.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: "No blogs found" });
    });
  
    
    afterAll(async () => {
        // Close any open connections
        await mongoose.connection.close(); // if using mongoose
      });
  });

describe("create blogs", () => {
    afterEach(() => {
        jest.clearAllMocks();
    })

    let req, res;
    beforeEach(() => {
        req = {
            body: {
                title: 'Blog 1',
                description: 'Description 1',
                content: 'Content 1'
            },
            user: {
                username: 'user1' 
            }
        }, 
        res = mockResponse();
     });

    test('should return 400 if blog details are empty', async () => {
        req.body = {};
        await createBlog(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send.mock.calls[0][0]).toEqual({ message: 'Missing required field(s)' });
        
    });

    test('should return 401 if user is not logged in', async () => {
        req.user = null;
        await createBlog(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send.mock.calls[0][0]).toEqual({ message: "User not authenticated or username not available" })
    })

    test('should return 409 if blog title already exists', async () => {
        // Mock BlogModel.findOne to return a blog with the same title
        BlogModel.findOne = jest.fn().mockResolvedValue({
            title: 'Blog 1',
            description: 'Description 1',
            content: 'Content 1',
            author: 'user1'
        });
    
        // Set the user and blog details
        req.user = { username: 'user1' };
        req.body = {
            title: 'Blog 1',
            description: 'Description 1',
            content: 'Content 1'
        };
    
        // Call the createBlog function
        await createBlog(req, res);
    
        // Assert that the response status is 409
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.send).toHaveBeenCalledTimes(1);
        expect(res.send).toHaveBeenCalledWith({ message: "This title is already taken. Please choose another one." });
    });
    

    test("should create a new blog", async () => {
        // Mock BlogModel.findOne to return null, indicating no blog with the same title exists
        BlogModel.findOne = jest.fn().mockResolvedValue(null);
        const newBlog = {
            title: 'Blog 123',
            description: 'Description 1',
            content: 'Content 1',
            author: 'user1',
            save: jest.fn().mockResolvedValue({
                title: 'Blog 1',
                description: 'Description 1',
                content: 'Content 1',
                author: 'user1',
              }),
        }
        BlogModel.mockImplementation(() => newBlog)
        
        await createBlog(req, res);

        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.send).toHaveBeenCalledTimes(1)
        expect(res.send).toHaveBeenCalledWith({ message: "Blog Created Successfully", blog: newBlog });
    })

})


describe("it should updateblogs",  () => {
    let req, res;
    beforeEach(() => {
        req = {
            body: {
                
                title: 'desi',
                description: 'desi1',
                content: "my desi desi"
            },
            params: {
                id: "blog1"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
        };
    })

    afterEach(() => {
        jest.clearAllMocks();
    });


    test('test if blog id is passed before update',  async () => {
        BlogModel.findOne = jest.fn().mockResolvedValue(null);
        req.params.id = {};
        await updateBlog(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: "Blog not found" })
    });


    
    test('should find and update blog via the id', async () => {
        const updatedBlog = {
            _id: 'blog1',
            title: 'desi',
            description: 'desi1',
            content: "my desi desi"
        };
        
        // Mock the BlogModel to return the updatedBlog object
        BlogModel.findByIdAndUpdate.mockResolvedValue(updatedBlog);
    
        req.body = {
            title: 'desi',
            description: 'desi1',
            content: 'my desi desi'
        };
        req.params.id = 'blog1';
    
        await updateBlog(req, res);
    
        expect(BlogModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'blog1',
            {
                title: 'desi',
                description: 'desi1',
                content: 'my desi desi'
            },
            { new: true, runValidators: true }
        );
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            message: "Blog Updated Successfully",
            blog: updatedBlog
        });
    });

    it('should return 500 on error', async () => {
        // Mocking BlogModel.findOne to reject with an error
        BlogModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        await updateBlog(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: "Error Updating Blog" });
    });
    

    

});


describe('should find blog by id', () => {
    let req, res;

    beforeEach(() => {
        req = {
            // body: {
            //     title: 'desi',
            //     description: 'desi1',
            //     content: "my desi desi"
            // },
            params: {
                id: "blog1"
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    test("should return error if blog id not found ", async () => {
        req.params.id = {}
        await getBlogById(req, res)
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({message:"Blog not found"});
    });


    it('should return success if specific blog is found', async () => {
        const findBlog = {
            _id: 'blog1',
            title: 'Blog Title',
            description: 'Blog Description',
            content: 'Blog Content',
        };

        // Mocking BlogModel.findOne to resolve with the blog data
        BlogModel.findOne.mockResolvedValue(findBlog);

        await getBlogById(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(findBlog);
    });

    it('should return 404 if blog is not found', async () => {
        // Mocking BlogModel.findOne to resolve with null (blog not found)
        BlogModel.findOne.mockResolvedValue(null);

        await getBlogById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({ message: "Blog not found" });
    });

    it('should return 500 on error', async () => {
        // Mocking BlogModel.findOne to reject with an error
        BlogModel.findOne.mockRejectedValue(new Error('Database error'));

        await getBlogById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({ message: "Error fetching Blog" });
    });
    

});




describe('should delete blog with matching id', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body:{
                _id: 'blog1',
                title: 'Blog Title',
                description: 'Blog Description',
                content: 'Blog Content',
            },
            params: {
                id: "blog1"
            }},
            res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
                json: jest.fn(),
                }
    })


    it('should return error if blog id is not found', async () => {
        req.params.id = {}
        await deleteBlog(req, res)
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({message:"Blog not found"});
        
    });


    it('should delete a blog if blog is found ', async () => {
        const blogtoDelete = {
            _id: 'blog1',
            title: 'Blog Title',
            description: 'Blog Description',
            content: 'Blog Content',
        }

        BlogModel.mockResolvedValue(blogtoDelete)
        await deleteBlog(req, res);

        expect(BlogModel.findOneAndDelete).toHaveBeenCalledWith({"_id": "blog1"});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith("Blog successfully deleted");
    })
  
})




