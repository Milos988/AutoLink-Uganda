const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key';

function authenticateToken(req, res, next) {
	const token = req.cookies.token;


	if (!token) return res.status(401).json({ message: 'Access denied' });

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ message: 'Invalid token' });
		req.user = user;
		next();
	});
}

module.exports = authenticateToken;
