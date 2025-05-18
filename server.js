const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

// Routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const filters = require('./routes/filters');

// ✅ MIDDLEWARE (MUST COME BEFORE ROUTES)
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ✅ ROUTES
app.use('/api', authRoutes);
app.use('/api', listingRoutes); // single mounting is enough
app.use('/api/filters', filters);

// ✅ START SERVER (just once)
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
