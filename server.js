const filters = require('./routes/filters');
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const listings = require('./routes/listings');
const db = require('./db');
const authRoutes = require('./routes/auth');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


app.use(express.static(path.join(__dirname, 'public')));

// Your API routes

app.use('/api/listings', listings);

app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});

// API Filter
app.use('/api/filters', filters);

// registration and login
app.use(cookieParser());

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', authRoutes);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

/*
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

 */




