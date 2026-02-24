
import { defineComponent, h } from 'vue';
import { toast, Toast } from '../services/toast';

export default defineComponent({
    name: 'ToastContainer',
    setup() {
        const getIcon = (type: Toast['type']) => {
            switch (type) {
                case 'success': return 'check_circle';
                case 'error': return 'error';
                case 'warning': return 'warning';
                default: return 'info';
            }
        };

        const getColor = (type: Toast['type']) => {
            switch (type) {
                case 'success': return 'bg-emerald-500';
                case 'error': return 'bg-red-500';
                case 'warning': return 'bg-amber-500';
                default: return 'bg-blue-500';
            }
        };

        return () => h('div', {
            class: 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-full max-w-sm px-4'
        }, toast.toasts.value.map((t: Toast) =>
            h('div', {
                key: t.id,
                class: `${getColor(t.type)} text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto animate-in slide-in-from-top fade-in duration-300 cursor-pointer w-full`,
                onClick: () => toast.remove(t.id)
            }, [
                h('span', { class: 'material-icons-round text-xl shrink-0' }, getIcon(t.type)),
                h('span', { class: 'text-sm font-bold flex-1' }, t.message)
            ])
        ));
    }
});
