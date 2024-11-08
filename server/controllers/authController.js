import { auth } from '../config/firebaseAdminConfig.js';

export const verifyToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send({ valid: false, message: 'Token is required' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    res.status(200).send({ valid: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send({ valid: false, message: 'Invalid or expired token' });
  }
};
