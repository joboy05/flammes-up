
import { Post, UserProfile, ChatMessage, Story } from '../types';
import { db_firebase } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  getDoc,
  where,
  Timestamp,
  increment,
  arrayUnion
} from "firebase/firestore";

export interface Confession {
  id: string;
  user: string;
  content: string;
  flames: number;
  isFlamedByMe?: boolean;
  time: string;
  createdAt: any;
}

export interface Mission {
  id: string;
  title: string;
  reward: string;
  location: string;
  user: string;
  time: string;
  isTaken?: boolean;
  createdAt: any;
}

export interface Trajet {
  id: string;
  from: string;
  to: string;
  time: string;
  seats: number;
  price: string;
  driver: string;
  contact: string;
  createdAt: any;
}

export interface RestoVote {
  [restoName: string]: 'vide' | 'ca_va' | 'plein' | null;
}

// Ce service utilise maintenant Firebase Firestore pour le temps réel.
export const db = {
  // --- POSTS ---
  subscribePosts: (callback: (posts: Post[]) => void) => {
    const q = query(collection(db_firebase, "posts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      callback(posts);
    });
  },

  addPost: async (post: Partial<Post>) => {
    await addDoc(collection(db_firebase, "posts"), {
      ...post,
      createdAt: Timestamp.now()
    });
  },

  updatePost: async (postId: string, data: Partial<Post>) => {
    const postRef = doc(db_firebase, "posts", postId);
    await updateDoc(postRef, data);
  },

  // --- PROFILE (Reste en localStorage pour l'instant car lié à l'appareil) ---
  getProfile: (): UserProfile => {
    const data = localStorage.getItem('up_profile');
    if (data) return JSON.parse(data);
    return {
      name: 'Étudiant UP',
      phone: '',
      faculty: 'FLASH (Lettres & Arts)',
      level: 'Licence 1',
      residence: 'externe',
      maritalStatus: 'non_defini',
      avatar: '',
      bio: '',
      vibesReceived: 0,
      upPoints: 0,
      hasStory: false,
      isProfileComplete: false,
      role: 'user'
    };
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem('up_profile', JSON.stringify(profile));
  },
  updateProfile: async (userId: string, data: Partial<UserProfile>) => {
    const ref = doc(db_firebase, "users", userId);
    await updateDoc(ref, data);
  },

  // --- CONFESSIONS ---
  subscribeConfessions: (callback: (confessions: Confession[]) => void) => {
    const q = query(collection(db_firebase, "confessions"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const confessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Confession));
      callback(confessions);
    });
  },

  addConfession: async (confession: Partial<Confession>) => {
    await addDoc(collection(db_firebase, "confessions"), {
      ...confession,
      createdAt: Timestamp.now()
    });
  },

  toggleConfessionFlame: async (confessionId: string, isFlamed: boolean) => {
    const ref = doc(db_firebase, "confessions", confessionId);
    await updateDoc(ref, {
      flames: increment(isFlamed ? 1 : -1)
    });
  },

  // --- MISSIONS ---
  subscribeMissions: (callback: (missions: Mission[]) => void) => {
    const q = query(collection(db_firebase, "missions"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mission));
      callback(missions);
    });
  },

  addMission: async (mission: Partial<Mission>) => {
    await addDoc(collection(db_firebase, "missions"), {
      ...mission,
      createdAt: Timestamp.now()
    });
  },

  toggleMissionTaken: async (missionId: string, isTaken: boolean) => {
    const ref = doc(db_firebase, "missions", missionId);
    await updateDoc(ref, { isTaken });
  },

  // --- TRAJETS ---
  subscribeTrajets: (callback: (trajets: Trajet[]) => void) => {
    const q = query(collection(db_firebase, "trajets"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const trajets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trajet));
      callback(trajets);
    });
  },

  addTrajet: async (trajet: Partial<Trajet>) => {
    await addDoc(collection(db_firebase, "trajets"), {
      ...trajet,
      createdAt: Timestamp.now()
    });
  },

  // --- MARKETPLACE ---
  subscribeProducts: (callback: (products: any[]) => void) => {
    const q = query(collection(db_firebase, "products"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(products);
    });
  },

  addProduct: async (product: any) => {
    await addDoc(collection(db_firebase, "products"), {
      ...product,
      createdAt: Timestamp.now()
    });
  },

  // --- RESTO VOTES ---
  subscribeRestoVotes: (callback: (votes: RestoVote) => void) => {
    return onSnapshot(doc(db_firebase, "status", "resto"), (doc) => {
      if (doc.exists()) {
        callback(doc.data() as RestoVote);
      } else {
        callback({});
      }
    });
  },

  saveRestoVote: async (restoName: string, status: string | null) => {
    const ref = doc(db_firebase, "status", "resto");
    await setDoc(ref, { [restoName]: status }, { merge: true });
  },

  // --- MESSAGES ---
  subscribeMessages: (convId: string, callback: (messages: any[]) => void) => {
    const q = query(collection(db_firebase, "conversations", convId, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(msgs);
    });
  },

  sendMessage: async (convId: string, message: Partial<ChatMessage>) => {
    await addDoc(collection(db_firebase, "conversations", convId, "messages"), {
      ...message,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Timestamp.now(),
      type: message.type || 'text'
    });
  },

  // --- STORIES (24h) ---
  subscribeStories: (callback: (stories: Story[]) => void) => {
    const now = Timestamp.now();
    const q = query(
      collection(db_firebase, "stories"),
      where("expiresAt", ">", now),
      orderBy("expiresAt", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      const stories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      callback(stories);
    });
  },

  addStory: async (story: Partial<Story>) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours
    await addDoc(collection(db_firebase, "stories"), {
      ...story,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt)
    });
  },

  // --- ADMIN STATS ---
  getGlobalStats: async () => {
    // In a production app, use Cloud Functions to maintain counters.
    // For this prototype, we'll fetch all docs to get the count.
    try {
      const { getCountFromServer } = await import("firebase/firestore");
      const usersSnapshot = await getCountFromServer(collection(db_firebase, "users"));
      const storiesSnapshot = await getCountFromServer(collection(db_firebase, "stories"));
      return {
        userCount: usersSnapshot.data().count,
        activeStories: storiesSnapshot.data().count
      };
    } catch (e) {
      return { userCount: 0, activeStories: 0 };
    }
  },

  // --- LEADERBOARD ---
  subscribeLeaderboard: (callback: (users: UserProfile[]) => void) => {
    const q = query(
      collection(db_firebase, "users"),
      orderBy("vibesReceived", "desc"),
      where("vibesReceived", ">", 0) // Only show those with vibes
    );
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      callback(users);
    });
  },

  subscribeUsers: (callback: (users: UserProfile[]) => void) => {
    return onSnapshot(collection(db_firebase, "users"), (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as UserProfile);
      callback(users);
    });
  }
};
