import { defineComponent, h } from 'vue';

export default defineComponent({
    name: 'Skeleton',
    props: {
        width: { type: String, default: '100%' },
        height: { type: String, default: '1rem' },
        borderRadius: { type: String, default: '0.5rem' },
        class: { type: String, default: '' }
    },
    setup(props) {
        return () => h('div', {
            class: `bg-slate-200 dark:bg-white/5 animate-pulse ${props.class}`,
            style: {
                width: props.width,
                height: props.height,
                borderRadius: props.borderRadius,
            }
        });
    }
});
