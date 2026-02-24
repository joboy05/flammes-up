
import { ref } from 'vue';

// Socket.IO client — lazy loaded
let socket: any = null;
const isConnected = ref(false);

// Event listeners registry
const listeners: Map<string, Set<Function>> = new Map();

async function connect() {
    if (socket) return;

    try {
        // Dynamic import pour ne pas charger socket.io-client si pas besoin
        const { io } = await import('socket.io-client');

        const wsUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : window.location.origin;

        socket = io(wsUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            isConnected.value = true;
            console.log('🔌 WebSocket connecté');
        });

        socket.on('disconnect', () => {
            isConnected.value = false;
            console.log('🔌 WebSocket déconnecté');
        });

        // Re-route all registered events
        for (const [event, callbackSet] of listeners) {
            for (const cb of callbackSet) {
                socket.on(event, cb);
            }
        }

    } catch (err) {
        console.warn('WebSocket connection failed, running without real-time:', err);
    }
}

function disconnect() {
    if (socket) {
        socket.disconnect();
        socket = null;
        isConnected.value = false;
    }
}

function on(event: string, callback: Function) {
    if (!listeners.has(event)) {
        listeners.set(event, new Set());
    }
    listeners.get(event)!.add(callback);

    if (socket) {
        socket.on(event, callback);
    }
}

function off(event: string, callback: Function) {
    if (listeners.has(event)) {
        listeners.get(event)!.delete(callback);
    }
    if (socket) {
        socket.off(event, callback);
    }
}

function emit(event: string, data?: any) {
    if (socket && isConnected.value) {
        socket.emit(event, data);
    }
}

function joinConversation(convId: string) {
    emit('join-conversation', convId);
}

function leaveConversation(convId: string) {
    emit('leave-conversation', convId);
}

export const ws = {
    connect,
    disconnect,
    on,
    off,
    emit,
    joinConversation,
    leaveConversation,
    isConnected
};
