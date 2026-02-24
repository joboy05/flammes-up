
import { ref, readonly } from 'vue';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

function addToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const id = nextId++;
    const toast: Toast = { id, message, type, duration };
    toasts.value.push(toast);

    setTimeout(() => {
        removeToast(id);
    }, duration);

    return id;
}

function removeToast(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id);
}

export const toast = {
    toasts: readonly(toasts),

    success(message: string, duration?: number) {
        return addToast(message, 'success', duration);
    },

    error(message: string, duration?: number) {
        return addToast(message, 'error', duration || 4000);
    },

    info(message: string, duration?: number) {
        return addToast(message, 'info', duration);
    },

    warning(message: string, duration?: number) {
        return addToast(message, 'warning', duration || 4000);
    },

    remove: removeToast
};
