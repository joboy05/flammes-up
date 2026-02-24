import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import admin from 'firebase-admin';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyCGgkiXSw5MifsprESwd6PNl0h_-PPz664',
    authDomain: 'flammeup-5327c.firebaseapp.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'flammeup-5327c',
    storageBucket: 'flammeup-5327c.firebasestorage.app',
    messagingSenderId: '541144218482',
    appId: '1:541144218482:web:8c387a86c14e31a0c6bbeb'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Admin (for token verification)
// Note: In a production environment, you would use a service account JSON.
// Here we rely on default credentials or project ID since we're in a controlled environment.
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: firebaseConfig.projectId
    });
}

export { db, admin };
