
import { defineComponent, h } from 'vue';
import { Motion } from '@motionone/vue';

export default defineComponent({
  name: 'TabBar',
  props: {
    activeTab: { type: String, required: true }
  },
  emits: ['updateActiveTab'],
  setup(props, { emit }) {
    const tabs = [
      { id: 'feed', icon: 'home', label: 'Flux' },
      { id: 'confessions', icon: 'forum', label: 'Secrets' },
      { id: 'hub', icon: 'apps', label: 'Services' },
      { id: 'messages', icon: 'forum', label: 'Messages' },
      { id: 'profile', icon: 'person', label: 'Profil' },
    ];

    return () => h('nav', {
      className: "fixed bottom-0 inset-x-0 max-w-md mx-auto h-20 bg-white/95 dark:bg-background-dark/95 ios-blur border-t border-primary/10 px-4 pb-6 pt-2 flex items-center justify-around z-50"
    }, [
      tabs.map((tab) => {
        const isActive = props.activeTab === tab.id || (tab.id === 'hub' && ['transport', 'events', 'resources'].includes(props.activeTab));
        return h(Motion, {
          key: tab.id,
          press: { scale: 0.8 },
          hover: { y: -2 },
          class: "flex-1"
        }, {
          default: () => h('button', {
            onClick: () => emit('updateActiveTab', tab.id),
            className: `w-full flex flex-col items-center gap-1 relative transition-all ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`
          }, [
            h('div', { className: "relative" }, [
              h(Motion, {
                animate: isActive ? { scale: [1, 1.3, 1], y: [0, -5, 0] } : {},
                transition: { duration: 0.4 }
              }, {
                default: () => h('span', { className: "material-icons-round text-2xl" }, tab.icon)
              }),
              tab.id === 'notifications' ? h('span', { className: "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-2 border-white dark:border-background-dark rounded-full" }) : null
            ]),
            h('span', { className: "text-[10px] font-bold uppercase tracking-tighter" }, tab.label),
            isActive ? h(Motion, {
              initial: { scale: 0, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              className: "absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(238,43,43,0.5)]"
            }) : null
          ])
        });
      }),
      h('div', { className: "absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-200 dark:bg-white/10 rounded-full pointer-events-none" })
    ]);
  }
});
