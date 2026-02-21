
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'Drawer',
  props: { isOpen: Boolean, userRole: String },
  emits: ['close', 'select'],
  setup(props, { emit }) {
    const items = [
      { id: 'feed', icon: 'home', label: 'Flux Campus' },
      ...(props.userRole === 'admin' ? [{ id: 'admin_dashboard', icon: 'dashboard_customize', label: 'Arène Admin' }] : []),
      { id: 'confessions', icon: 'forum', label: 'Confessions UP' },
      { id: 'hub', icon: 'apps', label: 'Tous les Services' },
      { id: 'marketplace', icon: 'storefront', label: 'Marché Étudiant' },
      { id: 'messages', icon: 'chat_bubble', label: 'Messages' },
      { id: 'profile', icon: 'person', label: 'Mon Profil' },
      { id: 'notifications', icon: 'notifications', label: 'Notifications' },
      { id: 'install', icon: 'download_for_offline', label: 'Installer l\'App' },
      { id: 'legal', icon: 'gavel', label: 'Mentions Légales' },
    ];

    return () => h('div', {
      class: `fixed inset-0 z-[100] transition-all duration-300 ${props.isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`
    }, [
      // Overlay
      h('div', {
        onClick: () => emit('close'),
        class: `absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${props.isOpen ? 'opacity-100' : 'opacity-0'}`
      }),
      // Content
      h('div', {
        class: `absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#121418] shadow-2xl transition-transform duration-300 transform ${props.isOpen ? 'translate-x-0' : '-translate-x-full'}`
      }, [
        h('div', { class: "p-6 flex flex-col h-full" }, [
          h('div', { class: "flex items-center gap-3 mb-10" }, [
            h('div', { class: "w-10 h-10 bg-primary rounded-xl flex items-center justify-center" }, [
              h('span', { class: "material-icons-round text-white" }, 'local_fire_department')
            ]),
            h('h1', { class: "text-xl font-black text-primary tracking-tighter" }, 'FLAMMES UP')
          ]),
          h('nav', { class: "flex-1 space-y-1" },
            items.map(i => h('button', {
              onClick: () => emit('select', i.id),
              class: "w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 text-slate-600 dark:text-slate-300 hover:text-primary active:scale-95 transition-all text-left"
            }, [
              h('span', { class: "material-icons-round" }, i.icon),
              h('span', { class: "font-bold text-sm" }, i.label)
            ]))
          ),
          h('div', { class: "mt-auto pt-6 border-t border-primary/10 opacity-30" }, [
            h('p', { class: "text-[10px] font-black uppercase tracking-[0.2em]" }, "JJTECH'S • VERSION 2.5")
          ])
        ])
      ])
    ]);
  }
});
