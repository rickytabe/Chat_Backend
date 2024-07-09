require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://animated-froyo-e199ee.netlify.app/', // Update with your Vite frontend URL
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

//enable cors
app.use(cors());

// MongoDB connection
const dbURl = process.env.MONGODB_URL;

console.log('Starting server...');
mongoose.connect(dbURl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('MongoDB connected...');
  }).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

 chatSchema = new mongoose.Schema({
  user: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', chatSchema);

io.on('connection', (socket) => {
  console.log('New client connected');

  // Emit all chat messages to the new client
  Chat.find().then((chats) => {
    socket.emit('init', chats);
  });

  socket.on('chatMessage', (msg) => {
    const chat = new Chat(msg);
    chat.save().then(() => {
      io.emit('chatMessage', msg);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
