const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
  });


app.set('io', io);

const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const locationRoutes = require('./routes/location');
const alertRoutes = require('./routes/alerts');
const geocodeRoutes = require('./routes/geocode');

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/geocode', geocodeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'GeoGuard API is running!' });
});

io.on('connection', (socket) => {
  console.log('📱 Client connected:', socket.id);
  socket.on('join-admin', (userId) => {
    socket.join(`admin-${userId}`);
  });
  socket.on('disconnect', () => {
    console.log('📱 Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});