import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'MessagesView',
  emits: ['openChat'],
  setup(props, { emit }) {
    const conversations = [
      { id: '1', name: 'fifamedohou', message: '😂', time: '20:27', unread: false, avatar: 'assets/avatar-2.svg', isProfessional: true },
      { id: '2', name: 'Moussa Koffi', message: 'Matricule valide !', time: 'Hier', unread: true, avatar: 'assets/avatar-1.svg', isProfessional: false },
      { id: '3', name: 'Anonyme #42', message: 'Est-ce que tu vends toujours ton ordi ?', time: 'Lundi', unread: false, avatar: null, isProfessional: false }
    ];

    return () => h('div', { class: "flex flex-col min-h-full bg-background-light dark:bg-background-dark" }, [
      h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 ios-blur px-5 pt-10 pb-4 flex items-center justify-between" }, [
        h('h1', { class: "text-3xl font-extrabold tracking-tight" }, 'Messages'),
        h('div', { class: "flex gap-4" }, [
          h('span', { class: "material-icons-round text-2xl" }, 'video_call'),
          h('span', { class: "material-icons-round text-2xl" }, 'edit_note')
        ])
      ]),

      h('div', { class: "px-5 divide-y divide-primary/5" }, 
        conversations.map(c => h('div', { 
          key: c.id, 
          onClick: () => emit('openChat', c.id),
          class: "flex items-center gap-4 py-4 active:bg-primary/5 transition-colors cursor-pointer" 
        }, [
          h('div', { class: "relative shrink-0" }, [
            c.avatar ? h('img', { 
              src: c.avatar, 
              class: `w-14 h-14 rounded-full object-cover border-2 border-primary/10`,
            }) : h('div', { 
              class: "w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary" 
            }, [
              h('span', { class: "material-icons-round text-3xl" }, 'person_outline')
            ]),
            c.unread ? h('div', { class: "absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary border-2 border-white dark:border-background-dark rounded-full shadow-sm" }) : null
          ]),
          h('div', { class: "flex-1 min-w-0" }, [
            h('div', { class: "flex justify-between items-baseline mb-0.5" }, [
              h('h3', { class: "font-bold text-[15px] truncate" }, c.name),
              h('span', { class: `text-[11px] font-medium opacity-40` }, c.time)
            ]),
            h('div', { class: "flex items-center justify-between" }, [
              h('p', { class: `text-[13px] truncate ${c.unread ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500'}` }, c.message),
              c.unread ? h('div', { class: "w-2.5 h-2.5 bg-primary rounded-full ml-2" }) : null
            ])
          ])
        ]))
      )
    ]);
  }
});