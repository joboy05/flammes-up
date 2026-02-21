import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'ProfileView',
  props: { user: Object, isDarkMode: Boolean },
  emits: ['edit', 'logout'],
  setup(props, { emit }) {
    const defaultAvatar = 'assets/default-avatar.svg';

    return () => h('div', { class: "flex flex-col min-h-full pb-10" }, [
      h('div', { class: "p-8 space-y-10" }, [
        h('div', { class: "flex flex-col items-center text-center pt-4" }, [
          h('div', { class: "relative" }, [
            h('div', { class: `w-32 h-32 rounded-full p-1.5 transition-all duration-1000 ${props.user.hasStory ? 'bg-gradient-to-tr from-primary via-orange-500 to-rose-500 animate-pulse' : 'bg-slate-200 dark:bg-white/10'}` }, [
              h('div', { class: "w-full h-full rounded-full border-4 border-white dark:border-[#0f1115] overflow-hidden bg-slate-100" }, [
                h('img', { 
                  src: props.user.avatar || defaultAvatar, 
                  class: "w-full h-full object-cover" 
                })
              ])
            ]),
            h('button', { 
              onClick: () => emit('edit'),
              class: "absolute bottom-0 right-0 w-11 h-11 bg-primary text-white rounded-full border-4 border-white dark:border-[#0f1115] flex items-center justify-center shadow-xl active:scale-90 transition-all" 
            }, [
              h('span', { class: "material-icons-round text-sm" }, 'photo_camera')
            ])
          ]),
          h('h2', { class: "text-3xl font-black mt-6" }, props.user.name),
          h('div', { class: "mt-3 bg-primary/10 px-5 py-2 rounded-full flex items-center gap-2 border border-primary/20" }, [
            h('span', { class: "material-icons-round text-primary text-base" }, 'verified'),
            h('span', { class: "text-[10px] font-black uppercase text-primary tracking-[0.2em]" }, 'Étudiant Parakou')
          ])
        ]),

        h('div', { class: "grid grid-cols-2 gap-4" }, [
          h('div', { class: "bg-white dark:bg-white/5 p-6 rounded-[35px] border border-slate-100 dark:border-white/5 text-center shadow-sm" }, [
            h('p', { class: "text-3xl font-black text-primary tracking-tighter" }, props.user.vibesReceived),
            h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" }, 'Vibes Reçues')
          ]),
          h('div', { class: "bg-white dark:bg-white/5 p-6 rounded-[35px] border border-slate-100 dark:border-white/5 text-center shadow-sm" }, [
            h('p', { class: "text-3xl font-black tracking-tighter" }, '142'),
            h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" }, 'Points UP')
          ])
        ]),

        h('div', { class: "bg-white dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm" }, [
          [
            { label: 'Téléphone', val: props.user.phone, icon: 'phone', color: 'text-blue-500' },
            { label: 'Faculté', val: props.user.faculty, icon: 'school', color: 'text-primary' },
            { label: 'Statut Matrimonial', val: props.user.maritalStatus, icon: 'favorite', color: 'text-rose-500' },
            { label: 'Cité Universitaire', val: props.user.isResident ? 'Résident (U-Nord)' : 'Externe', icon: 'domain', color: 'text-emerald-500' }
          ].map((item, idx) => h('div', { 
            class: `flex items-center gap-4 p-6 ${idx !== 0 ? 'border-t border-slate-100 dark:border-white/5' : ''}` 
          }, [
            h('div', { class: `w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center ${item.color}` }, [
              h('span', { class: "material-icons-round text-2xl" }, item.icon)
            ]),
            h('div', [
              h('p', { class: "text-[9px] font-black uppercase tracking-widest opacity-40 mb-1" }, item.label),
              h('p', { class: "text-sm font-bold" }, item.val)
            ])
          ]))
        ]),

        h('div', { class: "space-y-3" }, [
          h('button', { 
            onClick: () => emit('edit'),
            class: "w-full py-5 rounded-[28px] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all" 
          }, 'Éditer mes infos'),
          h('button', { 
            onClick: () => (window as any).dispatchEvent(new CustomEvent('nav', { detail: 'legal' })),
            class: "w-full py-5 rounded-[28px] border border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all" 
          }, 'Confidentialité'),
          h('button', { 
            onClick: () => emit('logout'),
            class: "w-full py-5 rounded-[28px] bg-red-500/5 text-red-500 font-black uppercase tracking-widest text-xs active:scale-95 transition-all mt-4" 
          }, 'Déconnexion')
        ])
      ])
    ]);
  }
});