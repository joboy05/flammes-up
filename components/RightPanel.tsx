
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'RightPanel',
  setup() {
    const trends = [
      { tag: '#ExamenDroit', posts: '2.4K flammes' },
      { tag: '#BusUPZongo', posts: '850 flammes' },
      { tag: '#SoireeL1', posts: '1.2K flammes' }
    ];

    const urgentServices = [
      { name: 'Infirmerie', icon: 'medical_services', color: 'text-red-500' },
      { name: 'Bibliothèque', icon: 'auto_stories', color: 'text-amber-500' }
    ];

    return () => h('aside', { 
      class: "w-80 h-screen sticky top-0 p-8 space-y-8 bg-background-light dark:bg-background-dark hidden xl:block" 
    }, [
      // Search Box
      h('div', { class: "bg-slate-100 dark:bg-primary/5 rounded-2xl p-4 flex items-center gap-3 border border-primary/5 shadow-inner" }, [
        h('span', { class: "material-icons-round text-slate-400" }, 'search'),
        h('input', { type: 'text', placeholder: 'Rechercher sur le campus...', class: "bg-transparent border-none text-sm w-full focus:ring-0" })
      ]),

      // Trends
      h('div', { class: "bg-white dark:bg-primary/5 rounded-3xl p-6 border border-primary/5 shadow-sm" }, [
        h('h3', { class: "text-xs font-bold uppercase tracking-widest text-primary mb-6" }, 'En ce moment 🔥'),
        h('div', { class: "space-y-6" }, 
          trends.map(t => h('div', { class: "cursor-pointer group" }, [
            h('p', { class: "font-black text-sm group-hover:text-primary transition-colors" }, t.tag),
            h('p', { class: "text-[10px] text-slate-400 font-bold uppercase mt-1" }, t.posts)
          ]))
        )
      ]),

      // Quick Access
      h('div', { class: "bg-white dark:bg-primary/5 rounded-3xl p-6 border border-primary/5 shadow-sm" }, [
        h('h3', { class: "text-xs font-bold uppercase tracking-widest text-slate-400 mb-6" }, 'Services rapides'),
        h('div', { class: "grid grid-cols-1 gap-4" }, 
          urgentServices.map(s => h('button', { 
            class: "flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left" 
          }, [
            h('span', { class: ["material-icons-round", s.color] }, s.icon),
            h('span', { class: "font-bold text-xs" }, s.name)
          ]))
        )
      ]),

      // Campus Footer
      h('div', { class: "px-2 opacity-30 text-[10px] font-bold uppercase tracking-wider space-y-1" }, [
        h('p', "© 2025 Flammes UP Parakou"),
        h('p', "Tous droits réservés aux étudiants")
      ])
    ]);
  }
});
