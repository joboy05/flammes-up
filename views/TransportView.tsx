
import { defineComponent, ref, h, onMounted, onUnmounted } from 'vue';
import { db, Trajet } from '../services/db';

export default defineComponent({
  name: 'TransportView',
  emits: ['back'],
  setup(props, { emit }) {
    const trajets = ref<Trajet[]>([]);
    const isPosting = ref(false);
    const form = ref({ from: '', to: '', time: '', seats: '2', price: '' });
    let unsubscribe: any = null;

    onMounted(() => {
      unsubscribe = db.subscribeTrajets((newTrajets) => {
        trajets.value = newTrajets;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    const submitTrajet = async () => {
      if (!form.value.from.trim() || !form.value.to.trim() || !form.value.time.trim() || !form.value.price.trim()) return;
      const profile = db.getProfile();
      const t: Partial<Trajet> = {
        from: form.value.from.trim(),
        to: form.value.to.trim(),
        time: form.value.time.trim(),
        seats: parseInt(form.value.seats) || 2,
        price: form.value.price.trim(),
        driver: profile.name,
        contact: profile.phone || '—'
      };
      await db.addTrajet(t);
      form.value = { from: '', to: '', time: '', seats: '2', price: '' };
      isPosting.value = false;
    };

    return () => h('div', { class: "flex flex-col min-h-full bg-white dark:bg-background-dark" }, [
      h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 ios-blur px-5 py-4 border-b border-primary/10 flex items-center gap-4" }, [
        h('button', { onClick: () => emit('back'), class: "w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center" }, [
          h('span', { class: "material-icons-round" }, 'arrow_back')
        ]),
        h('h1', { class: "text-xl font-bold" }, 'Bus UP — Covoiturage')
      ]),

      h('div', { class: "p-5 space-y-4 pb-28" }, [
        // Header info
        h('div', { class: "bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-[28px]" }, [
          h('div', { class: "flex items-center gap-3 mb-2" }, [
            h('div', { class: "w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg shrink-0" }, [
              h('span', { class: "material-icons-round" }, 'directions_car')
            ]),
            h('div', [
              h('p', { class: "font-black text-sm text-indigo-600" }, "Covoiturage entre étudiants"),
              h('p', { class: "text-xs text-slate-500 dark:text-slate-400" }, "Partage un trajet, économise du transport"),
            ])
          ])
        ]),

        // Titre section
        h('div', { class: "flex items-center justify-between" }, [
          h('h2', { class: "text-sm font-black uppercase tracking-widest opacity-40" }, `${trajets.value.length} trajets disponibles`),
        ]),

        // Liste trajets
        ...trajets.value.map(t => h('div', {
          key: t.id,
          class: "bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-5 rounded-[30px] shadow-sm"
        }, [
          // Route
          h('div', { class: "flex items-center gap-3 mb-4" }, [
            h('div', { class: "flex flex-col items-center gap-1" }, [
              h('div', { class: "w-3 h-3 rounded-full bg-indigo-400 border-2 border-white dark:border-slate-900 shadow" }),
              h('div', { class: "w-0.5 h-6 bg-slate-200 dark:bg-white/10" }),
              h('div', { class: "w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-slate-900 shadow" }),
            ]),
            h('div', { class: "flex-1" }, [
              h('p', { class: "font-black text-base" }, t.from),
              h('p', { class: "font-black text-base text-primary" }, t.to),
            ]),
            h('div', { class: "text-right" }, [
              h('p', { class: "text-xl font-black text-indigo-500" }, t.price),
              h('p', { class: "text-[9px] font-bold opacity-30 uppercase" }, "par place"),
            ])
          ]),

          h('div', { class: "flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-4" }, [
            h('div', { class: "flex items-center gap-4 text-[10px] font-bold opacity-50" }, [
              h('div', { class: "flex items-center gap-1" }, [
                h('span', { class: "material-icons-round text-xs" }, 'schedule'),
                t.time
              ]),
              h('div', { class: "flex items-center gap-1" }, [
                h('span', { class: "material-icons-round text-xs" }, 'event_seat'),
                `${t.seats} place${t.seats > 1 ? 's' : ''}`
              ]),
              h('div', { class: "flex items-center gap-1" }, [
                h('span', { class: "material-icons-round text-xs" }, 'person'),
                t.driver
              ]),
            ]),
            h('a', {
              href: `tel:${t.contact}`,
              class: "bg-indigo-500 text-white font-black px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
            }, "Appeler")
          ])
        ]))
      ]),

      // Modale proposition de trajet
      isPosting.value ? h('div', { class: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center" }, [
        h('div', { class: "bg-white dark:bg-[#1a1d23] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-6 pb-12 sm:pb-6 flex flex-col gap-4" }, [
          h('div', { class: "flex items-center justify-between" }, [
            h('h3', { class: "text-xl font-black" }, "Proposer un trajet"),
            h('button', { onClick: () => isPosting.value = false, class: "p-2 opacity-40" }, [h('span', { class: "material-icons-round" }, 'close')])
          ]),
          ...[
            { key: 'from', placeholder: "Ex: Campus Nord", label: 'Départ' },
            { key: 'to', placeholder: "Ex: Zongo Marché", label: 'Arrivée' },
            { key: 'time', placeholder: "Ex: 17h30", label: 'Heure de départ' },
            { key: 'seats', placeholder: "Ex: 3", label: 'Places disponibles', type: 'number' },
            { key: 'price', placeholder: "Ex: 200F CFA", label: 'Prix par place' },
          ].map(field => h('div', { class: "flex flex-col gap-1" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40" }, field.label),
            h('input', {
              value: (form.value as any)[field.key],
              type: field.type || 'text',
              onInput: (e: any) => (form.value as any)[field.key] = e.target.value,
              placeholder: field.placeholder,
              class: "bg-slate-50 dark:bg-white/5 rounded-2xl px-4 py-4 text-sm font-medium border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-indigo-400/30 outline-none dark:text-white"
            })
          ])),
          h('button', {
            onClick: submitTrajet,
            disabled: !form.value.from.trim() || !form.value.to.trim() || !form.value.time.trim() || !form.value.price.trim(),
            class: "w-full bg-indigo-500 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 disabled:opacity-20 active:scale-95 transition-all"
          }, "Publier le trajet")
        ])
      ]) : null,

      // FAB
      h('button', {
        onClick: () => isPosting.value = true,
        class: "fixed bottom-24 right-6 w-16 h-16 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-95 transition-transform shadow-indigo-500/30"
      }, [h('span', { class: "material-icons-round text-3xl" }, 'add')])
    ]);
  }
});
