
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'DesktopSidebar',
  props: {
    activeTab: { type: String, required: true }
  },
  emits: ['updateActiveTab'],
  setup(props, { emit }) {
    const navItems = [
      { id: 'feed', icon: 'home', label: 'Flux Campus' },
      { id: 'confessions', icon: 'forum', label: 'Secrets UP' },
      { id: 'hub', icon: 'apps', label: 'Services' },
      { id: 'marketplace', icon: 'storefront', label: 'Marché' },
      { id: 'messages', icon: 'chat_bubble', label: 'Messages' },
      { id: 'profile', icon: 'person', label: 'Mon Profil' },
    ];

    return () => h('aside', { 
      class: "hidden md:flex flex-col w-20 lg:w-72 h-screen sticky top-0 bg-white dark:bg-background-dark border-r border-primary/5 p-4 lg:p-6" 
    }, [
      // Logo
      h('div', { class: "flex items-center gap-3 mb-10 px-2" }, [
        h('div', { class: "w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20" }, [
          h('span', { class: "material-icons-round text-white" }, 'local_fire_department')
        ]),
        h('h1', { class: "hidden lg:block text-xl font-black text-primary tracking-tighter" }, 'Flammes UP')
      ]),

      // Navigation
      h('nav', { class: "flex-1 space-y-2" }, 
        navItems.map(item => {
          const isActive = props.activeTab === item.id;
          return h('button', {
            onClick: () => emit('updateActiveTab', item.id),
            class: [
              "w-full flex items-center gap-4 p-3 lg:px-4 lg:py-3.5 rounded-2xl transition-all group",
              isActive ? "bg-primary text-white shadow-xl shadow-primary/20" : "hover:bg-primary/5 text-slate-500"
            ]
          }, [
            h('span', { class: ["material-icons-round", isActive ? "" : "group-hover:text-primary transition-colors"] }, item.icon),
            h('span', { class: "hidden lg:block font-bold text-sm" }, item.label)
          ])
        })
      ),

      // Signature Jjtech's
      h('div', { class: "mt-auto pt-6 px-2 border-t border-primary/5" }, [
        h('p', { class: "hidden lg:block text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest" }, 'Conçu avec passion'),
        h('p', { class: "text-[11px] font-black text-primary/40 lg:text-primary uppercase tracking-tighter mt-1" }, "Made by Jjtech's")
      ])
    ]);
  }
});
