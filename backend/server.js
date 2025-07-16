require('dotenv').config();

const { createServer } = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const setupSocketHandlers = require('./services/socketService');

const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: 'http://localhost:5173',
		credentials: true,
	},
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
	setupSocketHandlers(io);
	httpServer.listen(PORT, () => {
		console.log(`LinkSpace server running on port ${PORT}`);
		console.log('Socket.io server initialized');
	});
});
