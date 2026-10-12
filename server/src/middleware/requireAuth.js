const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token missing.' });
    }

    try {
        req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        return next();
    } catch (error) {
        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.NotBeforeError
        ) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

module.exports = requireAuth;
