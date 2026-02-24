import { Router } from 'express';
import { db } from '../config/firebase.js';
import { collection, addDoc, doc, getDocs, updateDoc, query, orderBy, limit, Timestamp, increment } from 'firebase/firestore';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/confessions
router.get('/', async (req, res) => {
    try {
        const q = query(collection(db, 'confessions'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const confessions = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt
        }));
        res.json({ confessions });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/confessions
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const confessionData = {
            user: req.user.phone,
            content,
            flames: 0,
            createdAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'confessions'), confessionData);
        const newConfession = { id: docRef.id, ...confessionData, createdAt: new Date().toISOString() };

        if (req.io) req.io.emit('new-confession', newConfession);

        res.status(201).json({ message: 'Confession publiée !', confession: newConfession });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH /api/confessions/:id/flame
router.patch('/:id/flame', authMiddleware, async (req, res) => {
    try {
        const inc = req.body.increment || 1;
        await updateDoc(doc(db, 'confessions', req.params.id), {
            flames: increment(inc)
        });

        if (req.io) req.io.emit('update-confession', { id: req.params.id, flameIncrement: inc });

        res.json({ message: 'Flame mis à jour' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
