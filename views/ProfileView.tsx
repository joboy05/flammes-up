import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'ProfileView',
  props: { user: Object, isDarkMode: Boolean },
  emits: ['edit', 'logout'],
  setup(props, { emit }) {
    const defaultAvatar = '/assets/default-avatar.svg';

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
          h('p', { class: "text-slate-500 dark:text-slate-400 font-medium text-sm mt-2 px-6 italic" }, props.user.bio || "Aucune bio définie."),
          h('div', { class: "mt-4 bg-primary/10 px-5 py-2 rounded-full flex items-center gap-2 border border-primary/20 mx-auto w-fit" }, [
            h('span', { class: "material-icons-round text-primary text-base" }, 'verified'),
            h('span', { class: "text-[10px] font-black uppercase text-primary tracking-[0.2em]" }, 'Étudiant Parakou')
          ])
        ]),

        h('div', { class: "grid grid-cols-2 gap-4" }, [
          h('div', { class: "bg-white dark:bg-white/5 p-6 rounded-[35px] border border-slate-100 dark:border-white/5 text-center shadow-sm" }, [
            h('p', { class: "text-3xl font-black text-primary tracking-tighter" }, props.user.vibesReceived || 0),
            h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" }, 'Vibes Reçues')
          ]),
          h('div', { class: "bg-white dark:bg-white/5 p-6 rounded-[35px] border border-slate-100 dark:border-white/5 text-center shadow-sm" }, [
            h('p', { class: "text-3xl font-black tracking-tighter" }, props.user.upPoints || 0),
            h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" }, 'Points UP')
          ])
        ]),

        h('div', { class: "bg-white dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm" }, [
          [
            { label: 'Téléphone', val: props.user.phone, icon: 'phone', color: 'text-blue-500' },
            { label: 'Email', val: props.user.email || 'Non renseigné', icon: 'alternate_email', color: 'text-indigo-400' },
            { label: 'Faculté', val: props.user.faculty, icon: 'school', color: 'text-primary' },
            { label: 'Niveau', val: props.user.level || 'Non défini', icon: 'trending_up', color: 'text-indigo-500' },
            { label: 'Statut Matrimonial', val: props.user.maritalStatus === 'non_defini' ? 'Secret' : props.user.maritalStatus, icon: 'favorite', color: 'text-rose-500' },
            { label: 'Résidence', val: props.user.residence === 'externe' ? 'En ville (Externe)' : props.user.residence, icon: 'location_city', color: 'text-amber-500' }
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

        // Section Galerie
        props.user.gallery && props.user.gallery.length > 0 ? h('div', { class: "space-y-4" }, [
          h('div', { class: "flex items-center justify-between px-2" }, [
            h('h3', { class: "text-[10px] font-black uppercase tracking-widest opacity-40" }, 'Galerie Photos & Vidéos'),
            h('span', { class: "text-[10px] font-bold text-primary" }, `${props.user.gallery.length} média(s)`)
          ]),
          h('div', { class: "grid grid-cols-2 gap-3" }, props.user.gallery.map((media: string) => h('div', {
            class: "aspect-square rounded-[35px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm bg-slate-50 dark:bg-white/5"
          }, [
            h('img', { src: media, class: "w-full h-full object-cover hover:scale-110 transition-transform duration-500" })
          ])))
        ]) : null,

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