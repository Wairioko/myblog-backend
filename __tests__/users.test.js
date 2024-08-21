import { UserModel } from 'C://Users//HP//Desktop//myblog-backend//src//models//userSchema.mjs';
import {userCreation, userLogin} from 'C://Users//HP//Desktop//myblog-backend//src//controllers//userController.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

jest.useFakeTimers();

jest.mock('../src/models/userSchema.mjs');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');



describe('userCreation function', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        username: 'user',
        email: 'user@example.com',
        password: 'password123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  it('should hash the password before saving to the database', async () => {
    bcrypt.hash.mockResolvedValue('hashed_password'); // Mock the bcrypt hash function
    UserModel.prototype.save = jest.fn().mockResolvedValueOnce({ _id: 'user_id', username: 'user' }); // Mock save function
    jwt.sign.mockReturnValue('jwt_token'); // Mock JWT sign function

    await userCreation(req, res);

    // Check if bcrypt.hash was called with the correct password and salt
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    // Check if the user was saved with the hashed password
    expect(UserModel.prototype.save).toHaveBeenCalled();
    expect(UserModel.prototype.save.mock.calls[0][0].password).toBe('hashed_password');
    // Check if JWT was created with the correct data
    expect(jwt.sign).toHaveBeenCalledWith({ id: 'user_id', username: 'user' }, expect.any(String), { expiresIn: '1h' });
    // Check if the response status and json are correct
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ token: 'jwt_token', message: 'User SignUp Successful' });
  });

  it('should return 400 if username, email, or password is missing', async () => {
    req.body = {}; // Empty body

    await userCreation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Please Fill The Missing User Detail(s)' });
  });

  it('should return 400 if email or username is already taken', async () => {
    // Mock a duplicate key error
    UserModel.prototype.save = jest.fn().mockRejectedValueOnce({
      code: 11000,
      keyValue: { email: 'user@example.com' },
    });

    await userCreation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'The email "user@example.com" is already taken' });
  });

  it('should return 500 if there is a server error', async () => {
    // Mock a general server error
    UserModel.prototype.save = jest.fn().mockRejectedValueOnce(new Error('Server error'));

    await userCreation(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error creating new user' });
  });
});

describe('userLogin function', () => {
  let req, res;

  beforeEach(() => {
      req = {
          body: {
              email: 'test@example.com',
              password: 'password123',
          },
      };
      res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
          json: jest.fn(),
      };
  });

  it('should return 401 if email or password is missing', async () => {
      req.body = {};
      await userLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: 'Missing Required Fields' });
  });

  it('should return 404 if user is not found', async () => {
      UserModel.findOne.mockResolvedValue(null);
      await userLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'Could not find this user' });
  });

  it('should return 500 if user data is corrupted (password missing)', async () => {
      UserModel.findOne.mockResolvedValue({ email: 'test@example.com', password: null });
      await userLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'User data is corrupted' });
  });

  it('should return 401 if password does not match', async () => {
      UserModel.findOne.mockResolvedValue({ email: 'test@example.com', password: 'hashedpassword' });
      bcrypt.compare.mockResolvedValue(false);
      await userLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: 'Password does not match. Try again' });
  });

  it('should return 201 and a token if login is successful', async () => {
      const mockUser = { _id: 'userId123', username: 'testuser', email: 'test@example.com', password: 'hashedpassword' };
      UserModel.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockToken');

      await userLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
          token: 'mockToken',
          message: 'User Login Successful',
      });
  });

  it('should return 500 if there is an internal error', async () => {
      UserModel.findOne.mockRejectedValue(new Error('Internal Error'));
      await userLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: 'Unable to Login at this time' });
  });

  afterAll(async () => {
    // Close any open connections
    await mongoose.connection.close(); // if using mongoose
  });

});