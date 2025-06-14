const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log('MongoDB connected to LinkSpace');
	} catch (error) {
		console.log('MongoDB connection error:', error);
		process.exit(1);
	}
};

app.get('/api/test', (req, res) => {
	res.json({ message: 'LinkSpace API is working!' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

module.exports = { app, connectDB };
