import { db } from './backend/config/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function check() {
  try {
    const snapshot = await getDocs(collection(db, 'conversations'));
    console.log('Conversations count:', snapshot.size);
    snapshot.forEach(doc => {
      console.log('Conv ID:', doc.id, 'Data:', doc.data());
    });
  } catch (err) {
    console.error(err);
  }
}
check();
