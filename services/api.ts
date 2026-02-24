
import { toast } from './toast';

const API_BASE = '/api';

function getToken(): string | null {
    return localStorage.getItem('up_token');
}

function setToken(token: string) {
    localStorage.setItem('up_token', token);
}

function clearToken() {
    localStorage.removeItem('up_token');
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getToken();
    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || `Erreur ${res.status}`);
        }

        return data;
    } catch (err: any) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            toast.error('Pas de connexion au serveur. Vérifie que le backend est lancé.');
        }
        throw err;
    }
}

export const api = {
    // === AUTH ===
    async register(data: { phone: string; password: string; name: string; faculty?: string; level?: string }) {
        const result = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        setToken(result.token);
        toast.success(result.message || 'Inscription réussie !');
        return result;
    },

    async login(phone: string, password: string) {
        const result = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, password })
        });
        setToken(result.token);
        toast.success(result.message || 'Connexion réussie !');
        return result;
    },

    async googleLogin(idToken: string) {
        const result = await request('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken })
        });
        setToken(result.token);
        toast.success(result.message || 'Connexion Google réussie !');
        return result;
    },

    async getMe() {
        return request('/auth/me');
    },

    async updateProfile(data: any) {
        const result = await request('/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        toast.success('Profil mis à jour !');
        return result;
    },

    logout() {
        clearToken();
        localStorage.removeItem('up_auth');
        localStorage.removeItem('up_profile');
    },

    isLoggedIn(): boolean {
        return !!getToken();
    },

    // === POSTS ===
    async getPosts() {
        return request('/posts');
    },

    async createPost(data: any) {
        const result = await request('/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        toast.success('Post publié ! 🔥');
        return result;
    },

    async updatePost(id: string, data: any) {
        return request(`/posts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    // === CONFESSIONS ===
    async getConfessions() {
        return request('/confessions');
    },

    async createConfession(content: string) {
        const result = await request('/confessions', {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        toast.success('Confession publiée ! 🤫');
        return result;
    },

    async flameConfession(id: string, increment: number) {
        return request(`/confessions/${id}/flame`, {
            method: 'PATCH',
            body: JSON.stringify({ increment })
        });
    },

    // === STORIES ===
    async getStories() {
        return request('/stories');
    },

    async createStory(content: string, type: 'image' | 'video') {
        const result = await request('/stories', {
            method: 'POST',
            body: JSON.stringify({ content, type })
        });
        toast.success('Story publiée ! ✨');
        return result;
    },

    // === MESSAGES ===
    async getConversationsAll() {
        return request('/messages/conversations/all');
    },

    async getMessages(convId: string) {
        return request(`/messages/${convId}`);
    },

    async sendMessage(convId: string, data: any) {
        return request(`/messages/${convId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // === MISSIONS ===
    async getMissions() {
        return request('/missions');
    },

    async createMission(data: any) {
        const result = await request('/missions', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        toast.success('Mission créée !');
        return result;
    },

    async updateMission(id: string, data: any) {
        return request(`/missions/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },

    // === TRAJETS ===
    async getTrajets() {
        return request('/trajets');
    },

    async createTrajet(data: any) {
        const result = await request('/trajets', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        toast.success('Trajet publié ! 🚗');
        return result;
    },

    // === MARKETPLACE ===
    async getProducts() {
        return request('/products');
    },

    async createProduct(data: any) {
        const result = await request('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        toast.success('Produit ajouté au marché !');
        return result;
    },

    // === RESTO ===
    async getRestoVotes() {
        return request('/resto');
    },

    async voteResto(restoName: string, status: string | null) {
        const result = await request('/resto', {
            method: 'POST',
            body: JSON.stringify({ restoName, status })
        });
        toast.success('Vote enregistré !');
        return result;
    },

    // === LEADERBOARD ===
    async getLeaderboard() {
        return request('/leaderboard');
    },

    // === ADMIN ===
    async getAdminStats() {
        return request('/admin/stats');
    },

    async getUsers() {
        return request('/users');
    }
};
