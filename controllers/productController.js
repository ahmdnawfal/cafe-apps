import 'express-async-errors';
import prisma from '../lib/prisma.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../errors/customError.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *         description:
 *           type: string
 *           description: The description of the product
 *         category:
 *           type: string
 *           description: The category of the product
 *       example:
 *         id: 1
 *         name: Coffee
 *         category: Coffe
 *         price: 10.5
 *         description: A delicious cup of coffee
 */

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Returns the list of all the products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: The list of the products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

export const getAllProduct = async (req, res, next) => {
  try {
    const response = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(StatusCodes.OK).json({
      status: 'OK',
      statusCode: StatusCodes.OK,
      msg: 'SUCCESS',
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The product was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
export const createProduct = async (req, res, next) => {
  const data = {
    ...req.body,
  };

  try {
    const response = await prisma.product.create({
      data,
    });

    res.status(StatusCodes.CREATED).json({
      status: 'Created',
      statusCode: StatusCodes.CREATED,
      msg: 'Successfully create product',
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get the product by id
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: The product description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */

export const getProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const response = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    res.status(StatusCodes.OK).json({
      status: 'OK',
      statusCode: StatusCodes.OK,
      msg: 'SUCCESS',
      data: response,
    });
  } catch (error) {
    if (error.meta.message.startsWith('Malformed ObjectID:')) {
      throw new BadRequestError(`no product with id ${id}`);
    }

    next(error);
  }
};

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: Delete the product by id
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product id
 *     responses:
 *       202:
 *         description: The product was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */

export const deleteProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const response = await prisma.product.delete({
      where: {
        id,
      },
    });

    res.status(StatusCodes.ACCEPTED).json({
      status: 'Accepted',
      statusCode: StatusCodes.ACCEPTED,
      msg: 'Successfully delete product',
      data: response,
    });
  } catch (error) {
    if (error.meta.message.startsWith('Malformed ObjectID:')) {
      throw new BadRequestError(`no product with id ${id}`);
    }

    next(error);
  }
};
