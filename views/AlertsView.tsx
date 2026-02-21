
import { defineComponent, ref, h } from 'vue';

export default defineComponent({
  name: 'AlertsView',
  emits: ['back'],
  setup(props, { emit }) {
    const isWriting = ref(false);
    const newAlertText = ref('');
    const alerts = ref([
      { id: '1', text: "Le prof de Micro L2 vient d'entrer en Amphi 500. Dépêchez-vous !", type: 'prof', time: '1 min', votes: 12 },
      { id: '2', text: "Coupure d'électricité au bâtiment G, les amphis sont dans le noir.", type: 'urgent', time: '5 min', votes: 8 },
      { id: '3', text: "Vente de tickets resto prolongée jusqu'à 14h aujourd'hui.", type: 'info', time: '20 min', votes: 5 }
    ]);

    const postAlert = () => {
      if (!newAlertText.value.trim()) return;
      alerts.value.unshift({
        id: Date.now().toString(),
        text: newAlertText.value,
        type: 'info',
        time: 'À l’instant',
        votes: 1
      });
      newAlertText.value = '';
      isWriting.value = false;
    };

    return () => h('div', { class: "flex flex-col min-h-full bg-white dark:bg-[#0f1115]" }, [
      h('header', { class: "sticky top-0 z-40 bg-white/95 dark:bg-[#0f1115]/95 ios-blur px-5 py-4 border-b border-primary/10 flex items-center gap-4" }, [
        h('button', { onClick: () => emit('back'), class: "w-10 h-10 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center active:scale-90 transition-all" }, [
          h('span', { class: "material-icons-round" }, 'arrow_back')
        ]),
        h('h1', { class: "text-xl font-black text-orange-600 tracking-tight" }, 'Alertes Direct')
      ]),

      h('div', { class: "p-4 space-y-4 pb-32" }, 
        alerts.value.map(a => h('div', { class: "bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-5 rounded-[32px] shadow-sm flex gap-4 transition-all hover:border-orange-500/30" }, [
          h('div', { class: `w-3 h-3 rounded-full mt-1.5 shrink-0 ${a.type === 'urgent' ? 'bg-red-500 animate-pulse' : a.type === 'prof' ? 'bg-blue-500' : 'bg-orange-500'}` }),
          h('div', { class: "flex-1" }, [
            h('p', { class: "text-sm font-bold leading-relaxed mb-3 text-slate-800 dark:text-slate-200" }, a.text),
            h('div', { class: "flex items-center gap-4" }, [
              h('span', { class: "text-[9px] font-black uppercase text-orange-500 tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-full" }, a.type),
              h('span', { class: "text-[9px] opacity-30 font-black uppercase tracking-wider" }, a.time)
            ])
          ]),
          h('div', { class: "flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity" }, [
            h('button', { class: "material-icons-round text-lg hover:text-orange-500" }, 'keyboard_arrow_up'),
            h('span', { class: "text-[10px] font-black" }, a.votes)
          ])
        ]))
      ),

      // Input Modal for Alerte
      isWriting.value ? h('div', { class: "fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md" }, [
        h('div', { class: "bg-white dark:bg-[#1a1d23] w-full max-w-md rounded-[40px] p-8 space-y-6 shadow-2xl border border-white/10" }, [
          h('div', { class: "text-center space-y-2" }, [
            h('h3', { class: "text-2xl font-black text-orange-600" }, 'Signaler au Campus'),
            h('p', { class: "text-xs font-medium opacity-50" }, 'Partage une info utile en temps réel.')
          ]),
          h('textarea', { 
            value: newAlertText.value,
            onInput: (e: any) => newAlertText.value = e.target.value,
            placeholder: "Que se passe-t-il ? (Ex: Prof arrivé, Bus bloqué...)",
            class: "w-full h-32 bg-slate-100 dark:bg-white/5 border-none rounded-[24px] p-5 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
          }),
          h('div', { class: "grid grid-cols-2 gap-4" }, [
            h('button', { 
              onClick: () => isWriting.value = false, 
              class: "bg-slate-100 dark:bg-white/5 font-black text-xs uppercase tracking-widest py-5 rounded-[22px] active:scale-95 transition-all" 
            }, 'Annuler'),
            h('button', { 
              onClick: postAlert, 
              class: "bg-orange-500 text-white font-black text-xs uppercase tracking-widest py-5 rounded-[22px] shadow-xl shadow-orange-500/20 active:scale-95 transition-all" 
            }, 'Lancer')
          ])
        ])
      ]) : null,

      h('button', { 
        onClick: () => isWriting.value = true,
        class: "fixed bottom-28 right-6 w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(249,115,22,0.4)] z-40 active:scale-95 transition-all animate-bounce" 
      }, [
        h('span', { class: "material-icons-round text-4xl" }, 'bolt')
      ])
    ]);
  }
});
