import { Router } from 'express';
import { db } from '../config/firebase.js';
import { collection, addDoc, getDocs, doc, getDoc, setDoc, query, orderBy, where, limit, Timestamp } from 'firebase/firestore';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/messages/:convId
router.get('/:convId', authMiddleware, async (req, res) => {
    try {
        const q = query(
            collection(db, 'conversations', req.params.convId, 'messages'),
            orderBy('createdAt', 'asc')
        );
        const snapshot = await getDocs(q);

        const messages = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt
        }));

        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/messages/:convId
router.post('/:convId', authMiddleware, async (req, res) => {
    try {
        const { text, type, mediaUrl, location, audioDuration } = req.body;

        const messageData = {
            from: req.user.phone,
            text: text || '',
            type: type || 'text',
            mediaUrl: mediaUrl || null,
            location: location || null,
            audioDuration: audioDuration || null,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            createdAt: Timestamp.now()
        };

        // Create the message document
        const docRef = await addDoc(
            collection(db, 'conversations', req.params.convId, 'messages'),
            messageData
        );

        // Ensure the conversation document exists and is updated
        const convRef = doc(db, 'conversations', req.params.convId);
        await setDoc(convRef, {
            updatedAt: Timestamp.now(),
            participants: req.params.convId.split('-')
        }, { merge: true });

        const newMessage = { id: docRef.id, ...messageData, createdAt: new Date().toISOString() };

        if (req.io) {
            req.io.to(`conv-${req.params.convId}`).emit('new-message', {
                convId: req.params.convId,
                message: newMessage
            });
            // Broadcast to specific users for universal conversation update
            const participants = req.params.convId.split('-');
            participants.forEach(p => {
                req.io.to(`user-${p}`).emit('conversations-updated');
            });
        }

        res.status(201).json({ message: 'Message envoyé', data: newMessage });
    } catch (err) {
        console.error("Erreur send message:", err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/messages/conversations
router.get('/conversations/all', authMiddleware, async (req, res) => {
    try {
        const myPhone = req.user.phone;
        const snapshot = await getDocs(collection(db, 'conversations'));

        // Filter conversations involving me and fetch other participant details
        const conversations = [];
        for (const d of snapshot.docs) {
            const participants = d.id.split('-');
            if (participants.includes(myPhone)) {
                const otherPhone = participants.find(p => p !== myPhone);

                // Fetch other user profile
                let otherUser = { name: 'Utilisateur UP', avatar: null };
                if (otherPhone) {
                    const userDoc = await getDoc(doc(db, 'users', otherPhone));
                    if (userDoc.exists()) {
                        otherUser = {
                            name: userDoc.data().name || 'Utilisateur UP',
                            avatar: userDoc.data().avatar || null
                        };
                    }
                }

                // Get last message
                const msgQuery = query(
                    collection(db, 'conversations', d.id, 'messages'),
                    orderBy('createdAt', 'desc'),
                    limit(1)
                );
                const msgSnap = await getDocs(msgQuery);
                const lastMsg = msgSnap.docs[0]?.data();

                conversations.push({
                    id: d.id,
                    otherPhone,
                    name: otherUser.name,
                    avatar: otherUser.avatar,
                    message: lastMsg?.text || (lastMsg?.type === 'image' ? '📷 Image' : lastMsg?.type === 'audio' ? '🎤 Audio' : 'Aucun message'),
                    time: lastMsg?.time || '',
                    unread: false // Simulation for now
                });
            }
        }

        res.json({ conversations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
