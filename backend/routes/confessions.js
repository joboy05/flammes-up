import { Router } from 'express';
import { db } from '../config/firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, query, orderBy, limit, Timestamp, increment } from 'firebase/firestore';
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
        const { content, user } = req.body;
        const confessionData = {
            user: user || 'Anonyme',
            content,
            flames: 0,
            flamedBy: [],
            commentsList: [],
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

// PATCH /api/confessions/:id
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const { commentsList } = req.body;
        const updates = {};
        if (commentsList) {
            updates.commentsList = commentsList;
        }

        await updateDoc(doc(db, 'confessions', req.params.id), updates);

        if (req.io) req.io.emit('update-confession', { id: req.params.id, ...updates });

        res.json({ message: 'Confession mise à jour' });
    } catch (err) {
        console.error('Update confession error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH /api/confessions/:id/flame
router.patch('/:id/flame', authMiddleware, async (req, res) => {
    try {
        const confRef = doc(db, 'confessions', req.params.id);
        const confSnap = await getDoc(confRef);

        if (!confSnap.exists()) {
            return res.status(404).json({ error: 'Confession non trouvée' });
        }

        const confData = confSnap.data();
        const flamedBy = confData.flamedBy || [];
        const userId = req.user.phone;
        const isAlreadyFlamed = flamedBy.includes(userId);

        let newFlamedBy;
        if (isAlreadyFlamed) {
            newFlamedBy = flamedBy.filter(id => id !== userId);
        } else {
            newFlamedBy = [...flamedBy, userId];
        }

        const flamesCount = newFlamedBy.length;
        await updateDoc(confRef, {
            flamedBy: newFlamedBy,
            flames: flamesCount
        });

        if (req.io) {
            req.io.emit('update-confession', {
                id: req.params.id,
                flames: flamesCount,
                flamedBy: newFlamedBy
            });
        }

        res.json({
            message: isAlreadyFlamed ? 'Désenflammé' : 'Enflammé !',
            flames: flamesCount
        });
    } catch (err) {
        console.error('Confession flame error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
