
import { defineComponent, h } from 'vue';
import { StudyResource } from '../types';

export default defineComponent({
  name: 'ResourcesView',
  emits: ['back'],
  setup(props, { emit }) {
    const resources: StudyResource[] = [
      { id: '1', title: 'Annales Microéconomie 2022', faculty: 'FLASH', size: '1.2 MB', type: 'pdf', downloads: 145 },
      { id: '2', title: 'Cours Droit Constitutionnel', faculty: 'FDSP', size: '450 KB', type: 'pdf', downloads: 89 },
      { id: '3', title: 'Résumé Stats L2', faculty: 'IUT', size: '2.4 MB', type: 'zip', downloads: 212 },
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
          'Ressources ', h('span', { class: "text-primary" }, 'UP')
        ])
      ]),

      h('div', { class: "p-4" }, [
        h('div', { class: "bg-primary/5 rounded-2xl p-4 mb-6 border border-primary/10 flex items-center gap-4 shadow-sm dark:shadow-none" }, [
          h('div', { class: "w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg" }, [
            h('span', { class: "material-icons-round" }, 'upload_file')
          ]),
          h('div', [
            h('p', { class: "font-bold text-sm text-slate-800 dark:text-white" }, "Partage un document"),
            h('p', { class: "text-[10px] text-slate-500" }, "Aide tes camarades et gagne des points !")
          ])
        ]),

        h('div', { class: "flex gap-2 overflow-x-auto no-scrollbar mb-6" }, 
          ['Toutes', 'FLASH', 'FDSP', 'IUT', 'FA', 'FSS'].map((f, i) => h('button', { 
            key: f, 
            class: `px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border border-primary/5 ${i === 0 ? 'bg-primary text-white shadow-md' : 'bg-primary/5 text-primary'}` 
          }, f))
        ),

        h('div', { class: "space-y-3" }, 
          resources.map(r => h('div', { 
            key: r.id, 
            class: "bg-white dark:bg-primary/5 p-4 rounded-2xl border border-primary/10 shadow-sm flex items-center gap-4" 
          }, [
            h('div', { class: "w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 border border-primary/5" }, [
              h('span', { class: "material-icons-round text-2xl" }, 'picture_as_pdf')
            ]),
            h('div', { class: "flex-1 min-w-0" }, [
              h('h4', { class: "text-sm font-bold truncate text-slate-800 dark:text-white" }, r.title),
              h('div', { class: "flex items-center gap-2 mt-0.5" }, [
                h('span', { class: "text-[9px] font-bold text-primary uppercase tracking-wider" }, r.faculty),
                h('span', { class: "text-[9px] text-slate-400 font-bold" }, `• ${r.size}`)
              ])
            ]),
            h('button', { class: "w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center active:scale-90 transition-all shadow-sm" }, [
              h('span', { class: "material-icons-round text-xl" }, 'download')
            ])
          ]))
        )
      ])
    ]);
  }
});