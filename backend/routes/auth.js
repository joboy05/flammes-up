import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/firebase.js';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { generateToken, authMiddleware } from '../middleware/auth.js';
import { admin } from '../config/firebase.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { phone, password, name, faculty, level, email } = req.body;

        if (!phone || !password || !name) {
            return res.status(400).json({ error: 'Téléphone, mot de passe et nom requis' });
        }

        const existingUser = await getDoc(doc(db, 'users', phone));
        if (existingUser.exists()) {
            return res.status(409).json({ error: 'Ce numéro est déjà inscrit' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            phone,
            password: hashedPassword,
            name,
            email: email || '',
            faculty: faculty || '',
            level: level || '',
            residence: 'externe',
            maritalStatus: 'non_defini',
            avatar: '',
            bio: '',
            vibesReceived: 0,
            upPoints: 0,
            hasStory: false,
            isProfileComplete: false,
            role: phone === '0151852420' ? 'admin' : 'user',
            createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', phone), userData);

        const token = generateToken({ id: phone, phone, role: userData.role });
        const { password: _, ...userWithoutPassword } = userData;

        res.status(201).json({
            message: 'Inscription réussie !',
            token,
            user: userWithoutPassword
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Téléphone et mot de passe requis' });
        }

        const userDoc = await getDoc(doc(db, 'users', phone));

        if (!userDoc.exists()) {
            return res.status(404).json({ error: 'Compte non trouvé. Inscris-toi d\'abord !' });
        }

        const userData = userDoc.data();

        // Admin bypass check first
        let isValidPassword = false;
        if (phone === '0151852420' && password === 'Azerty123') {
            isValidPassword = true;
        } else if (userData.password) {
            isValidPassword = await bcrypt.compare(password, userData.password);
        }

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        const role = userData.role || (phone === '0151852420' ? 'admin' : 'user');
        const token = generateToken({ id: phone, phone, role });

        const { password: _, ...userWithoutPassword } = userData;

        res.json({
            message: 'Connexion réussie !',
            token,
            user: { ...userWithoutPassword, role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: 'Token Google manquant' });

        // Vérifier le token avec Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { phone_number, email, name, picture, uid } = decodedToken;

        // On utilise le téléphone comme ID si présent, sinon le UID ou email
        // Note: Google ne renvoie pas toujours le téléphone sans scopes spécifiques
        const identifier = phone_number || uid;

        const userDoc = await getDoc(doc(db, 'users', identifier));
        let userData;

        if (!userDoc.exists()) {
            // Création automatique pour une première connexion Google
            userData = {
                phone: phone_number || '',
                googleUid: uid,
                email: email || '',
                name: name || 'Étudiant UP',
                avatar: picture || '',
                faculty: '',
                level: '',
                residence: 'externe',
                maritalStatus: 'non_defini',
                vibesReceived: 0,
                upPoints: 100, // Bonus de bienvenue
                hasStory: false,
                isProfileComplete: false,
                role: 'user',
                createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', identifier), userData);
        } else {
            userData = userDoc.data();
            // Mettre à jour l'avatar si celui de Google est plus récent/existant
            if (picture && !userData.avatar) {
                await updateDoc(doc(db, 'users', identifier), { avatar: picture });
                userData.avatar = picture;
            }
        }

        const token = generateToken({ id: identifier, phone: userData.phone, role: userData.role });
        const { password: _, ...userWithoutPassword } = userData;

        res.json({
            message: 'Connexion Google réussie !',
            token,
            user: userWithoutPassword
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(401).json({ error: 'Token Google invalide ou expiré' });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', req.user.phone));
        if (!userDoc.exists()) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const userData = userDoc.data();
        const { password: _, ...userWithoutPassword } = userData;
        res.json({ user: userWithoutPassword });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH /api/auth/profile
router.patch('/profile', authMiddleware, async (req, res) => {
    try {
        const allowedFields = ['name', 'email', 'faculty', 'level', 'residence', 'maritalStatus', 'avatar', 'bio', 'isProfileComplete', 'gallery'];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'Aucun champ à modifier' });
        }

        await updateDoc(doc(db, 'users', req.user.phone), updates);

        const updatedDoc = await getDoc(doc(db, 'users', req.user.phone));
        const { password: _, ...userWithoutPassword } = updatedDoc.data();

        res.json({ message: 'Profil mis à jour !', user: userWithoutPassword });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
