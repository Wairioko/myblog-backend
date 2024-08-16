import jwt from 'jsonwebtoken';


export const verifyToken = (req, res, next) => {
    console.log('Request Headers for JWT verification:', req.headers);
    let token;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if(authHeader){
        if(authHeader.startsWith('Bearer')){
            token = authHeader.split('')[1];
        }else{
            token = authHeader
        }
    }
    if(!token){
        return res.status(401).json({error:"Access denied. You are not authorised to access this resource"});

    }
    try{
        const decoded = jwt.verify(token, jwtSecret);
        req.user = { _id: decoded.id, username: decoded.username };
        console.log("User Authenticated:", req.user);
        next();
    }catch(error){
        console.error('Token verification failed:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired." });
        }
        return res.status(403).json({ error: "Invalid token." });
 
    }
}


