
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'LegalView',
  emits: ['back'],
  setup(props, { emit }) {
    const sections = [
      {
        title: "1. Charte de la Communauté",
        content: "Flammes UP est un espace d'entraide et de partage pour les étudiants de Parakou. Tout comportement irrespectueux, harcèlement ou diffusion de fausses informations entraînera un bannissement immédiat."
      },
      {
        title: "2. Protection des Données",
        content: "Vos informations de profil sont chiffrées et ne sont jamais partagées avec des tiers. Pour les 'Confessions', votre anonymat est garanti par un système d'ID éphémère."
      },
      {
        title: "3. Sécurité du Marché",
        content: "Pour les transactions sur le Marché UP, privilégiez toujours les lieux publics du campus (Amphis, Restaurant) pour vos échanges physiques. Flammes UP ne gère pas les paiements."
      },
      {
        title: "4. Droit à l'Image",
        content: "En participant à FaceMatch, vous acceptez que votre photo soit visible par les autres étudiants inscrits sur la plateforme."
      }
    ];

    return () => h('div', { class: "flex flex-col min-h-full bg-white dark:bg-[#0f1115]" }, [
      h('header', { class: "sticky top-0 z-50 bg-white/95 dark:bg-[#0f1115]/95 ios-blur px-5 py-6 border-b border-primary/10 flex items-center gap-4" }, [
        h('button', { onClick: () => emit('back'), class: "w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center active:scale-90 transition-all" }, [
          h('span', { class: "material-icons-round" }, 'arrow_back')
        ]),
        h('h1', { class: "text-xl font-black" }, 'Mentions Légales')
      ]),

      h('div', { class: "p-6 space-y-10" }, [
        h('div', { class: "text-center py-4" }, [
          h('div', { class: "w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4" }, [
            h('span', { class: "material-icons-round text-3xl" }, 'gavel')
          ]),
          h('p', { class: "text-xs font-black uppercase tracking-widest text-primary" }, 'Transparence & Sécurité')
        ]),

        sections.map(s => h('section', { class: "space-y-3" }, [
          h('h2', { class: "text-lg font-black text-slate-900 dark:text-white" }, s.title),
          h('p', { class: "text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium" }, s.content)
        ])),

        h('div', { class: "pt-10 text-center opacity-30" }, [
          h('p', { class: "text-[10px] font-black uppercase tracking-[0.3em]" }, "JJTECH'S • DIGITAL CAMPUS 2025")
        ])
      ])
    ]);
  }
});
