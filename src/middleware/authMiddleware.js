// This file intercepts requests for authorized pages and API actions, and it ensures that the user has a valid token
import jwt from 'jsonwebtoken';

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token"});
    }

    req.userId = decoded.id;
    next();
  });
}

export default authMiddleware;