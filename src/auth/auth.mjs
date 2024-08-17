import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const jwtSecret = process.env.jwtSECRET;
    console.log('Request Headers for JWT verification:', req.headers);

    let token;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) { // Note the space after 'Bearer'
            token = authHeader.split(' ')[1]; // Split by space and take the second part, which is the token
        } else {
            token = authHeader; // If it's not a Bearer token, assume the entire header is the token
        }
    }

    if (!token) {
        return res.status(401).json({ error: "Access denied. You are not authorized to access this resource" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = { _id: decoded.id, username: decoded.username };
        console.log("User Authenticated:", req.user);
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired." });
        }
        return res.status(403).json({ error: "Invalid token." });
    }
};

