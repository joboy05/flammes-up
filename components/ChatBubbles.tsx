
import { defineComponent, h, PropType } from 'vue';

export interface ChatBubble {
    id: string;
    name: string;
    avatar: string;
}

export default defineComponent({
    name: 'ChatBubbles',
    props: {
        bubbles: {
            type: Array as PropType<ChatBubble[]>,
            required: true
        }
    },
    emits: ['open', 'close'],
    setup(props, { emit }) {
        return () => h('div', {
            class: "fixed bottom-28 right-4 z-[9999] flex flex-col items-end gap-3 pointer-events-none"
        }, [
            props.bubbles.map(bubble => h('div', {
                key: bubble.id,
                class: "group relative pointer-events-auto animate-in slide-in-from-right duration-500"
            }, [
                // Close button
                h('button', {
                    onClick: (e: Event) => {
                        e.stopPropagation();
                        emit('close', bubble.id);
                    },
                    class: "absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-md scale-0 group-hover:scale-100 transition-transform z-10 hover:bg-rose-600"
                }, [
                    h('span', { class: "material-icons-round text-[12px] font-black" }, 'close')
                ]),

                // Bubble Avatar
                h('button', {
                    onClick: () => emit('open', bubble.id),
                    class: "w-14 h-14 rounded-full border-2 border-white dark:border-[#1a1d23] shadow-2xl overflow-hidden hover:scale-110 active:scale-95 transition-all bg-white dark:bg-[#1a1d23] ring-2 ring-primary/20"
                }, [
                    h('img', {
                        src: bubble.avatar || 'assets/default-avatar.svg',
                        class: "w-full h-full object-cover"
                    }),
                    // Online badge (dummy for aesthetic)
                    h('div', { class: "absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1a1d23] rounded-full" })
                ]),

                // Tooltip Name
                h('div', {
                    class: "absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl"
                }, bubble.name.split(' ')[0])
            ]))
        ]);
    }
});
