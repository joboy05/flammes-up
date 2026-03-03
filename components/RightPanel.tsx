import { defineComponent, h, ref, onMounted } from 'vue';
import { api } from '../services/api';

export default defineComponent({
  name: 'RightPanel',
  setup() {
    const trends = ref<any[]>([]);
    const urgentServices = ref<any[]>([]);
    const isLoading = ref(true);

    onMounted(async () => {
      try {
        const [tData, cData] = await Promise.all([
          api.getTrends(),
          api.getConfigServices()
        ]);
        trends.value = tData.trends || [];
        urgentServices.value = (cData.quickAccess || []).slice(0, 2); // Only show first 2 for right panel
      } catch (e) {
        console.error("RightPanel load error:", e);
      } finally {
        isLoading.value = false;
      }
    });

    return () => h('aside', {
      class: "w-80 h-screen sticky top-0 p-8 space-y-8 bg-background-light dark:bg-background-dark hidden xl:block overflow-y-auto"
    }, [
      // Search Box
      h('div', { class: "bg-slate-100 dark:bg-primary/5 rounded-2xl p-4 flex items-center gap-3 border border-primary/5 shadow-inner" }, [
        h('span', { class: "material-icons-round text-slate-400" }, 'search'),
        h('input', { type: 'text', placeholder: 'Rechercher sur le campus...', class: "bg-transparent border-none text-sm w-full focus:ring-0" })
      ]),

      // Trends
      h('div', { class: "bg-white dark:bg-primary/5 rounded-3xl p-6 border border-primary/5 shadow-sm" }, [
        h('h3', { class: "text-xs font-bold uppercase tracking-widest text-primary mb-6" }, 'En ce moment 🔥'),
        isLoading.value ? h('div', { class: "space-y-4 animate-pulse" }, [1, 2, 3].map(() => h('div', { class: "h-10 bg-slate-100 dark:bg-white/5 rounded-xl w-full" }))) :
          h('div', { class: "space-y-6" },
            trends.value.map(t => h('div', { class: "cursor-pointer group" }, [
              h('p', { class: "font-black text-sm group-hover:text-primary transition-colors" }, t.tag),
              h('p', { class: "text-[10px] text-slate-400 font-bold uppercase mt-1" }, t.posts)
            ]))
          )
      ]),

      // Quick Access
      h('div', { class: "bg-white dark:bg-primary/5 rounded-3xl p-6 border border-primary/5 shadow-sm" }, [
        h('h3', { class: "text-xs font-bold uppercase tracking-widest text-slate-400 mb-6" }, 'Services rapides'),
        isLoading.value ? h('div', { class: "space-y-4 animate-pulse" }, [1, 2].map(() => h('div', { class: "h-12 bg-slate-100 dark:bg-white/5 rounded-xl w-full" }))) :
          h('div', { class: "grid grid-cols-1 gap-4" },
            urgentServices.value.map(s => h('button', {
              class: "flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
            }, [
              h('span', { class: ["material-icons-round", s.color] }, s.icon),
              h('span', { class: "font-bold text-xs" }, s.name)
            ]))
          )
      ]),

      // Campus Footer
      h('div', { class: "px-2 opacity-30 text-[10px] font-bold uppercase tracking-wider space-y-1" }, [
        h('p', `© ${new Date().getFullYear()} Flammes UP Parakou`),
        h('p', "Tous droits réservés aux étudiants")
      ])
    ]);
  }
});
