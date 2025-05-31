import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // // console.log('Request headers:', req.headers);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        if (!token) {
          return res.status(401).json({ error: 'Not authorized, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded) {
          return res.status(401).json({ error: 'Not authorized, invalid token' });
        }

        const userId = decoded.userId || decoded.id;
        if (!userId) {
          return res.status(401).json({ error: 'Not authorized, invalid token format' });
        }

        const user = await User.findById(userId).select('-password');
        
        if (!user) {
          console.error('User not found for ID:', userId);
          return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
      } catch (error) {
        console.error('Token verification error:', error);
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ error: 'Not authorized, invalid token' });
        } else if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Session expired, please login again' });
        }
        return res.status(401).json({ error: 'Not authorized, authentication failed' });
      }
    } else {
      return res.status(401).json({ 
        error: 'Not authorized, no token provided',
        receivedAuthHeader: !!req.headers.authorization,
        authHeader: req.headers.authorization
      });
    }
  } catch (error) {
    console.error('Error in protect middleware:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (req.user.isAdmin) {
    return next();
  }
  
  res.status(403).json({ 
    error: 'Not authorized as an admin',
    user: {
      id: req.user._id,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  });
};
