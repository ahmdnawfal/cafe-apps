import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { UnauthenticatedError } from '../errors/customError.js';
import prisma from '../lib/prisma.js';
import { StatusCodes } from 'http-status-codes';
import 'express-async-errors';
import { createJWT } from '../utils/tokenUtils.js';

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     description: Endpoint for user registration. Hashes the user password and creates a new user.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 format: name
 *                 example: john
 *               role:
 *                 type: string
 *                 enum:
 *                   - ADMIN
 *                   - USER
 *                 example: USER
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongpassword123
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Created
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 msg:
 *                   type: string
 *                   example: Successfully register
 *                 data:
 *                   type: object
 *                   description: The created user object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: USER
 *       400:
 *         description: Bad request
 *       401:
 *         description: Conflict, email already exists
 *       500:
 *         description: Internal server error
 */

export const register = async (req, res, next) => {
  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;

  try {
    const userExisting = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (userExisting) {
      throw new UnauthenticatedError('Email already exists');
    }

    const user = await prisma.user.create({
      data: req.body,
    });

    res.status(StatusCodes.CREATED).json({
      status: 'Created',
      statusCode: StatusCodes.CREATED,
      msg: 'Successfully register',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 *     description: Endpoint for user login. Validates user credentials and returns a JWT token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: Successfully login
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 data:
 *                   type: object
 *                   description: The user object without the password
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: USER
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized, invalid credentials
 *       500:
 *         description: Internal server error
 */

export const login = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      throw new UnauthenticatedError('Invalid email credentials');
    }

    const isValidUser = await comparePassword(req.body.password, user.password);

    if (!isValidUser) {
      throw new UnauthenticatedError('Invalid password credentials');
    }

    const token = createJWT({ userId: user.id, role: user.role });

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    res.status(StatusCodes.OK).json({
      status: 'OK',
      statusCode: StatusCodes.OK,
      msg: 'Successfully login',
      accessToken: token,
      data: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout a user
 *     description: Endpoint to log out a user by clearing the authentication token cookie.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 msg:
 *                   type: string
 *                   example: Logout successful
 *       500:
 *         description: Internal server error
 */

export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  return res.status(StatusCodes.OK).json({
    status: 'OK',
    statusCode: StatusCodes.OK,
    msg: 'Logout successful',
  });
};
