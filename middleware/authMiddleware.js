import { UnauthenticatedError } from '../errors/customError.js';
import { verifyJWT } from '../utils/tokenUtils.js';

export const authenticateUser = async (req, res, next) => {
  const tokenHeader = req.header('Authorization');
  const tokenBearer = tokenHeader?.replace('Bearer ', '');

  const token = tokenBearer;

  if (!token) {
    throw new UnauthenticatedError('authentication invalid');
  }

  try {
    const { userId, role } = verifyJWT(token);
    req.user = { userId, role };
    next();
  } catch (error) {
    throw new UnauthenticatedError('authentication invalid');
  }
};
