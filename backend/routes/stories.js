import { Router } from 'express';
import { db } from '../config/firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/stories
router.get('/', async (req, res) => {
    try {
        const now = Timestamp.now();
        const q = query(
            collection(db, 'stories'),
            where('expiresAt', '>', now),
            orderBy('expiresAt', 'asc')
        );
        const snapshot = await getDocs(q);

        const stories = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
            expiresAt: d.data().expiresAt?.toDate?.()?.toISOString() || d.data().expiresAt
        }));

        res.json({ stories });
    } catch (err) {
        console.error('Get stories error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/stories
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content, type } = req.body;
        const userDocSnap = await getDoc(doc(db, 'users', req.user.phone));
        const user = userDocSnap.exists() ? userDocSnap.data() : {};

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const storyData = {
            userId: req.user.phone,
            name: user.name || 'Anonyme',
            avatar: user.avatar || '',
            content,
            type: type || 'image',
            createdAt: Timestamp.fromDate(now),
            expiresAt: Timestamp.fromDate(expiresAt)
        };

        const docRef = await addDoc(collection(db, 'stories'), storyData);
        const newStory = { id: docRef.id, ...storyData, createdAt: now.toISOString(), expiresAt: expiresAt.toISOString() };

        if (req.io) req.io.emit('new-story', newStory);

        res.status(201).json({ message: 'Story publiée !', story: newStory });
    } catch (err) {
        console.error('Create story error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
