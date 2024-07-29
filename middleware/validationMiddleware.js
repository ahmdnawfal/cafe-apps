import { body, validationResult } from 'express-validator';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customError.js';

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        if (errorMessages[0].startsWith('no products')) {
          throw new NotFoundError(errorMessages);
        }
        if (errorMessages[0].startsWith('not authorized')) {
          throw new UnauthorizedError('not authorized to access this route');
        }
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

export const validateProductInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('image').notEmpty().withMessage('image is required'),
  body('category').notEmpty().withMessage('category is required'),
  body('description').notEmpty().withMessage('description is required'),
  body('price')
    .notEmpty()
    .withMessage('price is required')
    .isFloat()
    .withMessage('invalid price'),
]);
