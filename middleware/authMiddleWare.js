const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key'; // use the same key from your login route

function authenticateToken(req, res, next) {
	const token = req.cookies?.token; // ✅ safely read from cookies

	if (!token) {
		return res.status(401).json({ message: 'Access denied. No token provided.' });
	}

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ message: 'Invalid token' });
		}

		req.user = user;
		next();
	});
}

module.exports = authenticateToken;
