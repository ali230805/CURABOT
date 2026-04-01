// server.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
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
const chatRoutes = require('./routes/chat');
const historyRoutes = require('./routes/history');

// Initialize express app
const app = express();
const httpServer = createServer(app);
app.set('trust proxy', 1);
const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_LOCAL_MONGO_URI = 'mongodb://localhost:27017/curabot';

const normalizeOrigin = (value = '') => value.trim().replace(/\/+$/, '');

const validateEnvironment = () => {
    if (!isProduction) {
        return;
    }

    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
    const missingEnvVars = requiredEnvVars.filter(
        (key) => !String(process.env[key] || '').trim()
    );

    if (missingEnvVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingEnvVars.join(', ')}`
        );
    }
};

const getMongoUri = () => {
    const configuredMongoUri = String(process.env.MONGODB_URI || '').trim();

    if (configuredMongoUri) {
        return configuredMongoUri;
    }

    return isProduction ? '' : DEFAULT_LOCAL_MONGO_URI;
};

const parseAllowedOrigins = () => {
    const configuredOrigins = [
        process.env.CLIENT_URL,
        process.env.RENDER_EXTERNAL_URL,
        process.env.ALLOWED_ORIGINS
    ]
        .filter(Boolean)
        .flatMap((value) => value.split(','))
        .map((value) => normalizeOrigin(value))
        .filter(Boolean);

    const defaultOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];

    return Array.from(new Set([...configuredOrigins, ...defaultOrigins]));
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
    origin: (origin, callback) => {
        const normalizedOrigin = origin ? normalizeOrigin(origin) : origin;

        if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id']
};

const io = new Server(httpServer, {
    cors: corsOptions
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'CURABOT backend is running'
    });
});

app.get('/healthz', (req, res) => {
    const mongoState = mongoose.connection.readyState;
    const mongoConnected = mongoState === 1;

    res.status(mongoConnected ? 200 : 503).json({
        success: mongoConnected,
        service: 'curabot-backend',
        mongoConnected,
        uptime: process.uptime()
    });
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});

const connectToDatabase = async () => {
    const mongoUri = getMongoUri();

    if (!mongoUri) {
        throw new Error('MONGODB_URI must be configured for production deployments.');
    }

    try {
        await mongoose.connect(mongoUri);
    } catch (error) {
        if (isProduction) {
            throw error;
        }

        console.error('Unable to connect to MongoDB. Continuing in development mode.');
    }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);
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

const startServer = async () => {
    try {
        validateEnvironment();
        await connectToDatabase();

        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start CURABOT backend:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = { app, io };
