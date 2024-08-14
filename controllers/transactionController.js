import 'express-async-errors';
import { nanoid } from 'nanoid';
import prisma from '../lib/prisma.js';
import { StatusCodes } from 'http-status-codes';
import { PENDING } from '../utils/constants.js';
import { reformTransaction } from '../utils/reformTransaction.js';

/**
 * @swagger
 * /api/transaction:
 *   post:
 *     summary: Create a new transaction
 *     tags:
 *       - Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *               - customerName
 *               - customerEmail
 *               - customerPhone
 *               - customerTableNumber
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - quantity
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The product ID
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of the product
 *               customerName:
 *                 type: string
 *                 description: The name of the customer
 *               customerEmail:
 *                 type: string
 *                 description: The email of the customer
 *               customerPhone:
 *                 type: string
 *                 description: The phone number of the customer
 *               customerTableNumber:
 *                 type: string
 *                 description: The table number of the customer
 *     responses:
 *       201:
 *         description: Successfully created transactions
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
 *                   example: Successfully created transactions
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The transaction ID
 *                     status:
 *                       type: string
 *                       example: PENDING
 *                     customerName:
 *                       type: string
 *                       description: The name of the customer
 *                     customerEmail:
 *                       type: string
 *                       description: The email of the customer
 *                     customerPhone:
 *                       type: string
 *                       description: The phone number of the customer
 *                     customerTableNumber:
 *                       type: string
 *                       description: The table number of the customer
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: The product ID
 *                           name:
 *                             type: string
 *                             description: The name of the product
 *                           price:
 *                             type: number
 *                             description: The price of the product
 *                           quantity:
 *                             type: integer
 *                             description: Quantity of the product
 *                     snapToken:
 *                       type: string
 *                       example: null
 *                     snapRedirectUrl:
 *                       type: string
 *                       example: null
 *       404:
 *         description: Products not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Not found
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 msg:
 *                   type: string
 *                   example: Products not found
 */

export const createTransaction = async (req, res) => {
  const {
    products,
    customerName,
    customerEmail,
    customerPhone,
    customerTableNumber,
  } = req.body;

  const productsFromDB = await prisma.product.findMany({
    where: {
      id: {
        in: products.map((product) => product.id),
      },
    },
  });

  if (productsFromDB.length === 0) {
    return res.status(404).json({
      statusCode: StatusCodes.NOT_FOUND,
      status: 'Not found',
      msg: 'Products not found',
    });
  }

  productsFromDB.forEach((product) => {
    const productFromRequest = products.find(
      (productFromRequest) => productFromRequest.id === product.id
    );

    product.quantity = productFromRequest.quantity;
  });

  const transactionId = `TRX-${nanoid(4)}-${nanoid(8)}`;
  const gross_amount = productsFromDB.reduce(
    (acc, product) => acc + product.quantity * product.price,
    0
  );

  await prisma.transaction.create({
    data: {
      id: transactionId,
      total: gross_amount,
      status: PENDING,
      customerName,
      customerEmail,
      customerPhone,
      customerTableNumber,
      snapToken: null,
      snapRedirectUrl: null,
    },
  });

  await prisma.transactionsItem.createMany({
    data: productsFromDB.map((product) => ({
      id: `TRX-ITEM-${nanoid(10)}`,
      transactionId,
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: product.quantity,
    })),
  });

  res.json({
    status: 'Created',
    statusCode: StatusCodes.CREATED,
    msg: 'Successfully created transactions',
    data: {
      id: transactionId,
      status: PENDING,
      customerName,
      customerEmail,
      customerPhone,
      customerTableNumber,
      products: productsFromDB,
      snapToken: null,
      snapRedirectUrl: null,
    },
  });
};

/**
 * @swagger
 * /api/transaction:
 *   get:
 *     summary: Retrieve a list of transactions
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter transactions by status (e.g., PENDING, COMPLETED)
 *     responses:
 *       200:
 *         description: A list of transactions
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
 *                   example: SUCCESS
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The transaction ID
 *                       total:
 *                         type: number
 *                         description: The total amount of the transaction
 *                       status:
 *                         type: string
 *                         description: The status of the transaction
 *                         example: PENDING
 *                       customerName:
 *                         type: string
 *                         description: The name of the customer
 *                       customerEmail:
 *                         type: string
 *                         description: The email of the customer
 *                       customerPhone:
 *                         type: string
 *                         description: The phone number of the customer
 *                       customerTableNumber:
 *                         type: string
 *                         description: The table number of the customer
 *                       transactionsItems:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productId:
 *                               type: string
 *                               description: The product ID
 *                             productName:
 *                               type: string
 *                               description: The name of the product
 *                             price:
 *                               type: number
 *                               description: The price of the product
 *                             quantity:
 *                               type: integer
 *                               description: The quantity of the product
 *                             product:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   description: The product ID
 *                                 name:
 *                                   type: string
 *                                   description: The name of the product
 *                                 price:
 *                                   type: number
 *                                   description: The price of the product
 *                                 image:
 *                                   type: string
 *                                   description: The image URL of the product
 *                                 category:
 *                                   type: string
 *                                   description: The category of the product
 */

export const getTransactions = async (req, res) => {
  const { status } = req.query;

  let where = {};

  if (status) {
    where = {
      status,
    };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      transactionsItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              category: true,
            },
          },
        },
      },
    },
  });

  res.json({
    status: 'OK',
    statusCode: StatusCodes.OK,
    msg: 'SUCCESS',
    data: transactions.map((transaction) => reformTransaction(transaction)),
  });
};

/**
 * @swagger
 * /api/transaction/{id}:
 *   get:
 *     summary: Retrieve a transaction by its ID
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: The details of the transaction
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
 *                   example: SUCCESS
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The transaction ID
 *                     total:
 *                       type: number
 *                       description: The total amount of the transaction
 *                     status:
 *                       type: string
 *                       description: The status of the transaction
 *                       example: PENDING
 *                     customerName:
 *                       type: string
 *                       description: The name of the customer
 *                     customerEmail:
 *                       type: string
 *                       description: The email of the customer
 *                     customerPhone:
 *                       type: string
 *                       description: The phone number of the customer
 *                     customerTableNumber:
 *                       type: string
 *                       description: The table number of the customer
 *                     transactionsItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             description: The product ID
 *                           productName:
 *                             type: string
 *                             description: The name of the product
 *                           price:
 *                             type: number
 *                             description: The price of the product
 *                           quantity:
 *                             type: integer
 *                             description: The quantity of the product
 *                           product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 description: The product ID
 *                               name:
 *                                 type: string
 *                                 description: The name of the product
 *                               price:
 *                                 type: number
 *                                 description: The price of the product
 *                               image:
 *                                 type: string
 *                                 description: The image URL of the product
 *                               category:
 *                                 type: string
 *                                 description: The category of the product
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Not found
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 msg:
 *                   type: string
 *                   example: Transaction not found
 */

export const getTransactionById = async (req, res) => {
  const { id } = req.params;

  const transaction = await prisma.transaction.findUnique({
    where: {
      id,
    },
    include: {
      transactionsItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!transaction) {
    return res.status(404).json({
      statusCode: StatusCodes.NOT_FOUND,
      status: 'Not found',
      msg: 'Transaction not found',
    });
  }

  res.json({
    status: 'OK',
    statusCode: StatusCodes.OK,
    msg: 'SUCCESS',
    data: reformTransaction(transaction),
  });
};

/**
 * @swagger
 * /api/transaction/{id}:
 *   post:
 *     summary: Update the status of a transaction
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the transaction
 *                 example: COMPLETED
 *     responses:
 *       202:
 *         description: Successfully updated the transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Accepted
 *                 statusCode:
 *                   type: integer
 *                   example: 202
 *                 msg:
 *                   type: string
 *                   example: Successfully updated transaction
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The transaction ID
 *                     total:
 *                       type: number
 *                       description: The total amount of the transaction
 *                     status:
 *                       type: string
 *                       description: The status of the transaction
 *                     paymentMethod:
 *                       type: string
 *                       example: null
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Not found
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 msg:
 *                   type: string
 *                   example: Transaction not found
 */

export const updateTransactionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const transaction = await prisma.transaction.update({
    where: {
      id,
    },
    data: {
      status,
      paymentMethod: null,
    },
  });

  if (!transaction) {
    return res.status(404).json({
      statusCode: StatusCodes.NOT_FOUND,
      status: 'Not found',
      msg: 'Transaction not found',
    });
  }

  res.json({
    status: 'Accepted',
    statusCode: StatusCodes.ACCEPTED,
    msg: 'Successfully update transaction',
    data: transaction,
  });
};
