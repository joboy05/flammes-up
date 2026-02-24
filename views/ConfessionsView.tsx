
import { defineComponent, ref, h, onMounted, onUnmounted } from 'vue';
import { db, Confession } from '../services/db';
import { toast } from '../services/toast';
import { formatRelativeDate } from '../services/dates';

export default defineComponent({
  name: 'ConfessionsView',
  setup() {
    const confessions = ref<Confession[]>([]);
    const isPosting = ref(false);
    const isSubmitting = ref(false);
    const newConfession = ref('');
    let unsubscribe: any = null;

    onMounted(() => {
      unsubscribe = db.subscribeConfessions((newConfessions) => {
        confessions.value = newConfessions;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    const toggleFlame = async (c: Confession) => {
      c.isFlamedByMe = !c.isFlamedByMe;
      await db.toggleConfessionFlame(c.id, c.isFlamedByMe);
    };

    const submitConfession = async () => {
      if (!newConfession.value.trim() || isSubmitting.value) return;
      isSubmitting.value = true;
      try {
        const anon = `Anonyme #${Math.floor(1000 + Math.random() * 9000)}`;
        const c: Partial<Confession> = {
          user: anon,
          content: newConfession.value.trim(),
          flames: 0,
          isFlamedByMe: false
        };
        await db.addConfession(c);
        newConfession.value = '';
        isPosting.value = false;
        toast.success("Confession propagée... 🤫");
      } catch (err: any) {
        toast.error("Échec de la propagation.");
      } finally {
        isSubmitting.value = false;
      }
    };

    return () => h('div', { class: "flex flex-col min-h-full" }, [
      h('div', { class: "px-6 py-8" }, [
        h('h1', { class: "text-2xl font-black text-primary uppercase tracking-tighter" }, 'Confessions Campus'),
        h('p', { class: "text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1" }, 'Ce qui se dit à Parakou reste à Parakou')
      ]),

      h('div', { class: "p-4 space-y-4 pb-28" },
        confessions.value.map(c => h('article', {
          key: c.id,
          class: "bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[30px] p-6 shadow-sm"
        }, [
          h('p', { class: "text-primary font-black text-[10px] uppercase tracking-widest mb-1" }, c.user),
          h('p', { class: "text-[10px] opacity-30 font-bold mb-3" }, formatRelativeDate(c.createdAt || c.time)),
          h('p', { class: "text-sm leading-relaxed mb-6 text-slate-800 dark:text-slate-200 font-medium" }, c.content),
          h('div', { class: "flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-4" }, [
            h('div', { class: "flex items-center gap-2" }, [
              h('span', { class: `material-icons-round text-lg ${c.isFlamedByMe ? 'text-primary' : 'opacity-30'}` }, 'local_fire_department'),
              h('span', { class: "text-xs font-black opacity-50" }, `${c.flames} flammes`)
            ]),
            h('button', {
              onClick: () => toggleFlame(c),
              class: `text-[10px] font-black uppercase px-4 py-2 rounded-full transition-all active:scale-95 ${c.isFlamedByMe ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary'}`
            }, c.isFlamedByMe ? '🔥 Flambant' : 'Enflammer')
          ])
        ]))
      ),

      // Modale d'ajout
      isPosting.value ? h('div', { class: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4" }, [
        h('div', { class: "bg-white dark:bg-[#1a1d23] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-6 pb-12 sm:pb-6 flex flex-col gap-5" }, [
          h('div', { class: "flex items-center justify-between" }, [
            h('div', [
              h('h3', { class: "text-xl font-black" }, "Confession anonyme"),
              h('p', { class: "text-xs opacity-40 mt-0.5" }, "Ton identité sera masquée automatiquement"),
            ]),
            h('button', { onClick: () => isPosting.value = false, class: "p-2 opacity-40" }, [h('span', { class: "material-icons-round" }, 'close')])
          ]),
          h('textarea', {
            value: newConfession.value,
            onInput: (e: any) => newConfession.value = e.target.value,
            placeholder: "Raconte ce que tu gardes pour toi depuis trop longtemps...",
            class: "w-full h-36 bg-slate-50 dark:bg-white/5 rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-primary/30 resize-none dark:text-white outline-none"
          }),
          h('button', {
            onClick: submitConfession,
            disabled: !newConfession.value.trim() || isSubmitting.value,
            class: "w-full bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 disabled:opacity-20 active:scale-95 transition-all flex items-center justify-center gap-2"
          }, isSubmitting.value ? [
            h('div', { class: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Propagation..."
          ] : "Publier anonymement")
        ])
      ]) : null,

      // FAB
      h('button', {
        onClick: () => isPosting.value = true,
        class: "fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-95 transition-transform"
      }, [h('span', { class: "material-icons-round text-3xl" }, 'edit')])
    ]);
  }
});
