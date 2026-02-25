import { Router } from 'express';
import { db } from '../config/firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, updateDoc, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/posts
router.get('/', async (req, res) => {
    try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
            };
        });

        res.json({ posts });
    } catch (err) {
        console.error('Get posts error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/posts
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content, type, audioData, audioDuration, image, location } = req.body;
        const userDocSnap = await getDoc(doc(db, 'users', req.user.phone));
        const user = userDocSnap.exists() ? userDocSnap.data() : {};

        const postData = {
            author: user.name || 'Anonyme',
            authorTag: user.faculty || '',
            avatar: user.avatar || '',
            content: content || '',
            type: type || 'text',
            stats: { flames: 0, comments: 0 },
            flamedBy: [],
            commentsList: [],
            audioData: audioData || null,
            audioDuration: audioDuration || null,
            image: image || null,
            location: location || null,
            userId: req.user.phone,
            createdAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'posts'), postData);
        const newPost = { id: docRef.id, ...postData, createdAt: new Date().toISOString() };

        if (req.io) req.io.emit('new-post', newPost);

        res.status(201).json({ message: 'Post publié !', post: newPost });
    } catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ error: 'Erreur lors de la publication' });
    }
});

// POST /api/posts/:id/flame
router.post('/:id/flame', authMiddleware, async (req, res) => {
    try {
        const postRef = doc(db, 'posts', req.params.id);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            return res.status(404).json({ error: 'Post non trouvé' });
        }

        const postData = postSnap.data();
        const flamedBy = postData.flamedBy || [];
        const userId = req.user.phone;
        const isFlambant = flamedBy.includes(userId);

        let newFlamedBy;
        if (isFlambant) {
            newFlamedBy = flamedBy.filter(id => id !== userId);
        } else {
            newFlamedBy = [...flamedBy, userId];
        }

        const flamesCount = newFlamedBy.length;
        await updateDoc(postRef, {
            flamedBy: newFlamedBy,
            'stats.flames': flamesCount
        });

        if (req.io) {
            req.io.emit('update-post', {
                id: req.params.id,
                stats: { ...postData.stats, flames: flamesCount },
                flamedBy: newFlamedBy
            });
        }

        res.json({
            message: isFlambant ? 'Désenflammé' : 'Enflammé !',
            isFlambant: !isFlambant,
            flames: flamesCount
        });
    } catch (err) {
        console.error('Flame error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH /api/posts/:id (for comments etc)
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const { commentsList } = req.body;
        const updates = {};
        if (commentsList) {
            updates.commentsList = commentsList;
            updates['stats.comments'] = commentsList.length;
        }

        await updateDoc(doc(db, 'posts', req.params.id), updates);

        if (req.io) req.io.emit('update-post', { id: req.params.id, ...updates });

        res.json({ message: 'Post mis à jour' });
    } catch (err) {
        console.error('Update post error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
