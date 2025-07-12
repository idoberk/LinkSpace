const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: add date/time conversion --> MongoDB uses UTC timezone.
// TODO: Clean the code and create global validation middleware to prevent code repetition

app.get('/api/test', (req, res) => {
	res.json({ message: 'LinkSpace API is working!' });
});

app.use('/api/account', require('./routes/accountRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
