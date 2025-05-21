const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const filters = require('./routes/filters');
const brandRoutes = require('./routes/brands');

// ✅ MIDDLEWARE
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
app.use('/api/listings', listingRoutes);
app.use('/api/filters', filters);
app.use('/api/brands', brandRoutes); // ✅ This is what was missing


// ✅ START SERVER
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
