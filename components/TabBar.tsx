
import { defineComponent, h } from 'vue';

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
        return h('button', {
          key: tab.id,
          onClick: () => emit('updateActiveTab', tab.id),
          className: `flex flex-col items-center gap-1 relative transition-all active:scale-90 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`
        }, [
          h('div', { className: "relative" }, [
            h('span', { className: "material-icons-round text-2xl" }, tab.icon),
            tab.id === 'notifications' ? h('span', { className: "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-2 border-white dark:border-background-dark rounded-full" }) : null
          ]),
          h('span', { className: "text-[10px] font-bold uppercase tracking-tighter" }, tab.label),
          isActive ? h('div', { className: "absolute -bottom-1 w-1 h-1 bg-primary rounded-full" }) : null
        ]);
      }),
      h('div', { className: "absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-200 dark:bg-white/10 rounded-full pointer-events-none" })
    ]);
  }
});
