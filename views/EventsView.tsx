
import { defineComponent, h } from 'vue';
import { CampusEvent } from '../types';

export default defineComponent({
  name: 'EventsView',
  emits: ['back'],
  setup(props, { emit }) {
    const events: CampusEvent[] = [
      { id: '1', title: 'Gala de Bienvenue L1', date: 'Samedi 14 Oct • 21h', location: 'Espace Culturel UP', type: 'party', organizer: 'BUE' },
      { id: '2', title: 'Conférence : IA & Droit', date: 'Mardi 17 Oct • 10h', location: 'Amphi 1000', type: 'academic', organizer: 'Faculté de Droit' },
      { id: '3', title: 'Tournoi Inter-Facs Foot', date: 'Jeudi 19 Oct • 16h', location: 'Stade Municipal', type: 'sport', organizer: 'Association Sportive' },
    ];

    return () => h('div', { class: "flex flex-col min-h-full bg-white dark:bg-background-dark transition-colors duration-500" }, [
      h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 ios-blur px-5 py-4 border-b border-primary/10 flex items-center gap-4 transition-colors duration-500" }, [
        h('button', { 
          onClick: () => emit('back'), 
          class: "w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center" 
        }, [
          h('span', { class: "material-icons-round" }, 'arrow_back')
        ]),
        h('h1', { class: "text-xl font-bold tracking-tight text-slate-900 dark:text-white" }, [
          'Agenda ', h('span', { class: "text-primary" }, 'Campus')
        ])
      ]),

      h('div', { class: "p-4 space-y-4" }, 
        events.map(e => h('div', { 
          key: e.id, 
          class: "relative overflow-hidden bg-white dark:bg-primary/5 rounded-3xl border border-primary/10 shadow-sm dark:shadow-none p-5 group transition-all active:scale-[0.98]" 
        }, [
          h('div', { 
            class: `absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 ${e.type === 'party' ? 'bg-purple-500' : e.type === 'academic' ? 'bg-blue-500' : 'bg-green-500'}` 
          }),
          
          h('div', { class: "flex justify-between items-start mb-4" }, [
            h('span', { 
              class: `text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${e.type === 'party' ? 'bg-purple-500/10 text-purple-500' : e.type === 'academic' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}` 
            }, e.type),
            h('span', { class: "text-[10px] font-bold text-slate-400" }, e.organizer)
          ]),

          h('h3', { class: "text-xl font-bold mb-1 leading-tight text-slate-900 dark:text-white" }, e.title),
          h('div', { class: "flex flex-col gap-1" }, [
            h('div', { class: "flex items-center gap-2 text-primary" }, [
              h('span', { class: "material-icons-round text-sm" }, 'event'),
              h('span', { class: "text-xs font-bold" }, e.date)
            ]),
            h('div', { class: "flex items-center gap-2 text-slate-500" }, [
              h('span', { class: "material-icons-round text-sm" }, 'location_on'),
              h('span', { class: "text-xs font-medium" }, e.location)
            ])
          ]),

          h('button', { class: "mt-5 w-full bg-primary text-white text-xs font-bold py-3 rounded-2xl shadow-lg shadow-primary/20" }, "Je participe")
        ]))
      )
    ]);
  }
});