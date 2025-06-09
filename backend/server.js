require('dotenv').config();

const { createServer } = require('http');
const { app, connectDB } = require('./app');

const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
	httpServer.listen(PORT, () => {
		console.log(`LinkSpace server running on port ${PORT}`);
	});
});
