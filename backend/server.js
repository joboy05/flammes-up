import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import confessionRoutes from './routes/confessions.js';
import storyRoutes from './routes/stories.js';
import messageRoutes from './routes/messages.js';
import generalRoutes from './routes/general.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://flammesup.netlify.app', 'https://flammesup.netlify.app'],
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://flammesup.netlify.app', 'https://flammesup.netlify.app'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Pour les images base64

// Injecter io dans les requêtes pour que les routes puissent broadcast
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', generalRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// WebSocket events
io.on('connection', (socket) => {
    console.log(`🔥 Client connecté: ${socket.id}`);

    // Rejoindre une room de conversation (pour les messages privés)
    socket.on('join-conversation', (convId) => {
        socket.join(`conv-${convId}`);
        console.log(`📨 ${socket.id} a rejoint conv-${convId}`);
    });

    socket.on('leave-conversation', (convId) => {
        socket.leave(`conv-${convId}`);
    });

    // Typing indicator
    socket.on('typing', ({ convId, user }) => {
        socket.to(`conv-${convId}`).emit('user-typing', { convId, user });
    });

    socket.on('stop-typing', ({ convId, user }) => {
        socket.to(`conv-${convId}`).emit('user-stop-typing', { convId, user });
    });

    socket.on('disconnect', () => {
        console.log(`👋 Client déconnecté: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`\n🔥 Flammes UP Backend`);
    console.log(`   Server running on port ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   WebSocket: ws://localhost:${PORT}\n`);
});
