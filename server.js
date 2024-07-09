require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

// MongoDB connection
const dbURL = process.env.MONGODB_URL;

console.log('Starting server...');
mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected...');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Define MongoDB schema and model
const chatSchema = new mongoose.Schema({
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', chatSchema);

// Socket.IO handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Emit all chat messages to the new client on connection
  Chat.find().then((chats) => {
    socket.emit('init', chats);
  });

  // Listen for new chat messages
  socket.on('chatMessage', (msg) => {
    const chat = new Chat(msg);
    chat.save().then(() => {
      io.emit('chatMessage', msg); // Broadcast message to all clients
    });
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://animated-froyo-e199ee.netlify.app'],
  methods: ['GET', 'POST'],
};
app.use(cors(corsOptions));

// Basic route to check server status
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
