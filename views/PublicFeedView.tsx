
import { defineComponent, h, onMounted } from 'vue';
import anime from 'animejs';

export default defineComponent({
  name: 'PublicFeedView',
  emits: ['join'],
  setup(props, { emit }) {
    onMounted(() => {
      // Animation de la couche externe
      (anime as any)({
        targets: '#hero-flame-outer',
        d: [
          { value: 'M50 120 C20 120 0 95 0 65 C0 35 50 5 50 5 C50 5 100 35 100 65 C100 95 80 120 50 120 Z' },
          { value: 'M50 125 C25 125 5 100 5 70 C5 40 50 0 50 0 C50 0 95 40 95 70 C95 100 75 125 50 125 Z' },
          { value: 'M50 115 C15 115 0 85 0 55 C0 25 50 10 50 10 C50 10 100 25 100 55 C100 85 85 115 50 115 Z' }
        ],
        easing: 'easeInOutQuad',
        duration: 1200,
        direction: 'alternate',
        loop: true
      });

      // Animation de la couche intermédiaire
      (anime as any)({
        targets: '#hero-flame-inner',
        d: [
          { value: 'M50 110 C30 110 15 90 15 70 C15 50 50 20 50 20 C50 20 85 50 85 70 C85 90 70 110 50 110 Z' },
          { value: 'M50 115 C35 115 20 95 20 75 C20 55 50 25 50 25 C50 25 80 55 80 75 C80 95 65 115 50 115 Z' },
          { value: 'M50 108 C28 108 18 88 18 68 C18 48 50 18 50 18 C50 18 82 48 82 68 C82 88 72 108 50 108 Z' }
        ],
        easing: 'easeInOutQuad',
        duration: 1000,
        delay: 100,
        direction: 'alternate',
        loop: true
      });

      // Animation du cœur (petit et vibrant)
      (anime as any)({
        targets: '#hero-flame-core',
        d: [
          { value: 'M50 100 C42 100 35 90 35 80 C35 70 50 55 50 55 C50 55 65 70 65 80 C65 90 58 100 50 100 Z' },
          { value: 'M50 102 C44 102 38 92 38 82 C38 72 50 58 50 58 C50 58 62 72 62 82 C62 92 56 102 50 102 Z' },
          { value: 'M50 98 C40 98 33 88 33 78 C33 68 50 53 50 53 C50 53 67 68 67 78 C67 88 60 98 50 98 Z' }
        ],
        easing: 'easeInOutQuad',
        duration: 800,
        delay: 200,
        direction: 'alternate',
        loop: true
      });
    });

    return () => h('div', {
      class: "relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#0a0505] transition-colors duration-500"
    }, [
      // Vibrant Gradients
      h('div', { class: "absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 dark:bg-primary/20 blur-[150px] rounded-full" }),
      h('div', { class: "absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 dark:bg-orange-600/10 blur-[120px] rounded-full" }),

      // Hero Section
      h('div', { class: "relative z-10 flex flex-col items-center text-center px-6 w-full max-w-lg" }, [
        // Flame SVG with Animation
        h('div', { class: "relative mb-8 filter drop-shadow-[0_0_30px_rgba(238,43,43,0.6)]" }, [
          h('svg', { class: "w-40 h-48", viewBox: "0 0 100 125", xmlns: "http://www.w3.org/2000/svg" }, [
            h('path', { id: "hero-flame-outer", fill: "#ee2b2b", d: "M50 120 C20 120 0 90 0 60 C0 30 50 0 50 0 C50 0 100 30 100 60 C100 90 80 120 50 120 Z" }),
            h('path', { id: "hero-flame-inner", fill: "#ff7b00", d: "M50 110 C30 110 15 90 15 70 C15 50 50 20 50 20 C50 20 85 50 85 70 C85 90 70 110 50 110 Z" }),
            h('path', { id: "hero-flame-core", fill: "#ffcc00", d: "M50 100 C40 100 30 85 30 75 C30 65 50 40 50 40 C50 40 70 65 70 75 C70 85 60 100 50 100 Z" }),
          ])
        ]),

        h('div', { class: "space-y-4 mb-12" }, [
          h('h1', { class: "text-6xl font-black tracking-tighter text-slate-900 dark:text-white" }, [
            'FLAMMES ', h('span', { class: "text-primary italic" }, 'UP')
          ]),
          h('p', { class: "text-lg font-medium text-slate-500 dark:text-slate-400 leading-tight max-w-xs mx-auto" },
            "L'étincelle qui connecte tout le campus de Parakou."
          )
        ]),

        h('button', {
          onClick: () => emit('join'),
          class: "group relative overflow-hidden bg-primary text-white font-black py-6 px-16 rounded-[35px] shadow-[0_25px_60px_rgba(238,43,43,0.4)] active:scale-95 transition-all w-full"
        }, [
          h('span', { class: "relative z-10 text-xl uppercase tracking-tighter" }, "Entrer dans l'arène"),
          h('div', { class: "absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" })
        ]),

        h('div', { class: "mt-12 flex items-center justify-center gap-6 opacity-40" }, [
          h('div', { class: "flex items-center gap-2 text-slate-900 dark:text-white" }, [
            h('span', { class: "material-icons-round text-sm" }, 'forum'),
            h('span', { class: "text-[10px] font-bold uppercase tracking-widest" }, 'Secrets')
          ]),
          h('div', { class: "w-1 h-1 bg-primary rounded-full" }),
          h('div', { class: "flex items-center gap-2 text-slate-900 dark:text-white" }, [
            h('span', { class: "material-icons-round text-sm" }, 'storefront'),
            h('span', { class: "text-[10px] font-bold uppercase tracking-widest" }, 'Marché')
          ])
        ])
      ]),

      h('p', { class: "absolute bottom-10 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]" },
        "DESIGNED BY JJTECH'S"
      )
    ]);
  }
});
