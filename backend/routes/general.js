import { Router } from 'express';
import { db } from '../config/firebase.js';
import { collection, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, query, orderBy, where, limit, Timestamp, increment, getCountFromServer } from 'firebase/firestore';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ===== MISSIONS =====
router.get('/missions', async (req, res) => {
    try {
        const q = query(collection(db, 'missions'), orderBy('createdAt', 'desc'), limit(30));
        const snapshot = await getDocs(q);
        const missions = snapshot.docs.map(d => ({
            id: d.id, ...d.data(),
            createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt
        }));
        res.json({ missions });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.post('/missions', authMiddleware, async (req, res) => {
    try {
        const { title, reward, location, category } = req.body;
        const userDocSnap = await getDoc(doc(db, 'users', req.user.phone));
        const user = userDocSnap.exists() ? userDocSnap.data() : {};

        const missionData = {
            title, reward, location,
            category: category || 'aide',
            user: user.name || 'Anonyme',
            isTaken: false,
            createdAt: Timestamp.now()
        };
        const docRef = await addDoc(collection(db, 'missions'), missionData);
        const newMission = { id: docRef.id, ...missionData, createdAt: new Date().toISOString() };
        if (req.io) req.io.emit('new-mission', newMission);
        res.status(201).json({ message: 'Mission créée !', mission: newMission });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.patch('/missions/:id', authMiddleware, async (req, res) => {
    try {
        await updateDoc(doc(db, 'missions', req.params.id), req.body);
        if (req.io) req.io.emit('update-mission', { id: req.params.id, ...req.body });
        res.json({ message: 'Mission modifiée' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== TRAJETS =====
router.get('/trajets', async (req, res) => {
    try {
        const q = query(collection(db, 'trajets'), orderBy('createdAt', 'desc'), limit(30));
        const snapshot = await getDocs(q);
        const trajets = snapshot.docs.map(d => ({
            id: d.id, ...d.data(),
            createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt
        }));
        res.json({ trajets });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.post('/trajets', authMiddleware, async (req, res) => {
    try {
        const { from, to, time, seats, price, contact } = req.body;
        const userDocSnap = await getDoc(doc(db, 'users', req.user.phone));
        const user = userDocSnap.exists() ? userDocSnap.data() : {};
        const trajetData = {
            from, to, time, seats, price, contact,
            driver: user.name || 'Anonyme',
            createdAt: Timestamp.now()
        };
        const docRef = await addDoc(collection(db, 'trajets'), trajetData);
        const newTrajet = { id: docRef.id, ...trajetData, createdAt: new Date().toISOString() };
        if (req.io) req.io.emit('new-trajet', newTrajet);
        res.status(201).json({ message: 'Trajet publié !', trajet: newTrajet });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== MARKETPLACE =====
router.get('/products', async (req, res) => {
    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(30));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(d => ({
            id: d.id, ...d.data(),
            createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt
        }));
        res.json({ products });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.post('/products', authMiddleware, async (req, res) => {
    try {
        const productData = {
            ...req.body,
            seller: req.user.phone,
            createdAt: Timestamp.now()
        };
        const docRef = await addDoc(collection(db, 'products'), productData);
        const newProduct = { id: docRef.id, ...productData, createdAt: new Date().toISOString() };
        if (req.io) req.io.emit('new-product', newProduct);
        res.status(201).json({ message: 'Produit ajouté !', product: newProduct });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== RESTO VOTES =====
router.get('/resto', async (req, res) => {
    try {
        const docSnap = await getDoc(doc(db, 'status', 'resto'));
        res.json({ votes: docSnap.exists() ? docSnap.data() : {} });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.post('/resto', authMiddleware, async (req, res) => {
    try {
        const { restoName, status } = req.body;
        await setDoc(doc(db, 'status', 'resto'), { [restoName]: status }, { merge: true });
        if (req.io) req.io.emit('update-resto', { restoName, status });
        res.json({ message: 'Vote enregistré !' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== LEADERBOARD =====
router.get('/leaderboard', async (req, res) => {
    try {
        const q = query(
            collection(db, 'users'),
            where('vibesReceived', '>', 0),
            orderBy('vibesReceived', 'desc'),
            limit(50)
        );
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(d => {
            const data = d.data();
            const { password, ...safe } = data;
            return safe;
        });
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== ADMIN STATS =====
router.get('/admin/stats', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès refusé' });
        }
        const usersSnap = await getCountFromServer(collection(db, 'users'));
        const storiesSnap = await getCountFromServer(collection(db, 'stories'));
        const postsSnap = await getCountFromServer(collection(db, 'posts'));
        res.json({
            userCount: usersSnap.data().count,
            activeStories: storiesSnap.data().count,
            postCount: postsSnap.data().count
        });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ===== USERS LIST =====
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        const users = snapshot.docs.map(d => {
            const data = d.data();
            const { password, ...safe } = data;
            return safe;
        });
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
