// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const symptomRoutes = require('./routes/symptoms');
const predictionRoutes = require('./routes/predictions');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true
    }
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/curabot', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
//app.use('/api/users', userRoutes);
//app.use('/api/symptoms', symptomRoutes);
//app.use('/api/predictions', predictionRoutes);
//app.use('/api/admin', adminRoutes);

// Socket.io for real-time chat
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('join-chat', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their chat room`);
    });
    
    socket.on('send-message', async (data) => {
        // Emit message to specific user room
        io.to(`user-${data.userId}`).emit('receive-message', {
            message: data.message,
            isBot: false,
            timestamp: new Date()
        });
        
        // Process with bot (call ML service)
        const botResponse = await processWithML(data.message);
        
        // Send bot response
        io.to(`user-${data.userId}`).emit('receive-message', {
            message: botResponse,
            isBot: true,
            timestamp: new Date()
        });
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// ML Service Integration
async function processWithML(userMessage) {
    try {
        const response = await axios.post(
            `${process.env.ML_API_URL}/predict`,
            { text: userMessage }
        );
        return response.data.response;
    } catch (error) {
        console.error('ML Service Error:', error);
        return "I'm having trouble processing your request. Please try again.";
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };