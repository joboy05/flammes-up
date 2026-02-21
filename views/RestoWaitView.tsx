
import { defineComponent, ref, h, onMounted, onUnmounted } from 'vue';
import { db, RestoVote } from '../services/db';

const RESTOS = [
  { name: 'Resto Central', icon: 'groups', color: 'amber' },
  { name: 'Resto Nord', icon: 'person', color: 'sky' },
  { name: 'Cafétéria IUT', icon: 'group', color: 'violet' },
];

const STATUS_CONFIG = {
  vide: { label: 'Vide 🟢', badge: 'Vide', wait: '~5 min', badgeColor: 'bg-emerald-500' },
  ca_va: { label: 'Ça va 🟡', badge: 'Normal', wait: '~20 min', badgeColor: 'bg-amber-400' },
  plein: { label: 'Plein ! 🔴', badge: 'Blindé', wait: '+45 min', badgeColor: 'bg-red-500' },
};

export default defineComponent({
  name: 'RestoWaitView',
  emits: ['back'],
  setup(props, { emit }) {
    const votes = ref<RestoVote>({});
    let unsubscribe: any = null;

    onMounted(() => {
      unsubscribe = db.subscribeRestoVotes((newVotes) => {
        votes.value = newVotes;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    const vote = async (restoName: string, status: 'vide' | 'ca_va' | 'plein') => {
      // Toggle : si déjà sélectionné, on désélectionne
      const newStatus = votes.value[restoName] === status ? null : status;
      await db.saveRestoVote(restoName, newStatus);
    };

    const getStatus = (restoName: string) => {
      const v = votes.value[restoName];
      return v ? STATUS_CONFIG[v] : null;
    };

    return () => h('div', { class: "flex flex-col min-h-full bg-white dark:bg-background-dark" }, [
      h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 ios-blur px-5 py-4 border-b border-primary/10 flex items-center gap-4" }, [
        h('button', { onClick: () => emit('back'), class: "w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center" }, [
          h('span', { class: "material-icons-round" }, 'arrow_back')
        ]),
        h('h1', { class: "text-xl font-bold" }, "Temps d'attente Resto")
      ]),

      h('div', { class: "p-6 space-y-6" }, [
        h('div', { class: "text-center py-4" }, [
          h('span', { class: "material-icons-round text-5xl text-amber-400 mb-2" }, 'lunch_dining'),
          h('h2', { class: "text-2xl font-black" }, "Midi à l'UP"),
          h('p', { class: "text-xs text-slate-500 uppercase tracking-widest font-bold mt-1" }, "Vote pour aider tes camarades")
        ]),

        ...RESTOS.map(r => {
          const currentStatus = getStatus(r.name);
          return h('div', { class: "bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-6 rounded-[32px] shadow-sm" }, [
            h('div', { class: "flex justify-between items-center mb-5" }, [
              h('div', [
                h('h3', { class: "text-lg font-black" }, r.name),
                h('p', { class: "text-[10px] font-bold opacity-30 uppercase tracking-widest" }, 'Vote communautaire')
              ]),
              currentStatus
                ? h('div', { class: `${currentStatus.badgeColor} text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase` }, currentStatus.badge)
                : h('div', { class: "bg-slate-100 dark:bg-white/5 text-slate-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase" }, 'Inconnu')
            ]),

            currentStatus ? h('div', { class: "flex items-end gap-1 mb-5" }, [
              h('span', { class: "text-3xl font-black tracking-tighter" }, currentStatus.wait),
              h('span', { class: "text-xs font-bold opacity-40 mb-1" }, "d'attente estimée")
            ]) : null,

            h('div', { class: "grid grid-cols-3 gap-2" }, [
              { id: 'vide', label: 'Vide 🟢' },
              { id: 'ca_va', label: 'Ça va 🟡' },
              { id: 'plein', label: 'Plein ! 🔴' },
            ].map(opt => h('button', {
              onClick: () => vote(r.name, opt.id as any),
              class: `py-3 rounded-2xl text-[10px] font-bold active:scale-95 transition-all border-2 ${votes.value[r.name] === opt.id
                ? 'border-primary bg-primary/10 text-primary scale-[1.02]'
                : 'border-transparent bg-slate-50 dark:bg-white/5 opacity-70'
                }`
            }, opt.label)))
          ]);
        })
      ])
    ]);
  }
});
