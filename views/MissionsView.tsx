
import { defineComponent, ref, h, onMounted, onUnmounted } from 'vue';
import { db, Mission } from '../services/db';
import { toast } from '../services/toast';
import { formatRelativeDate } from '../services/dates';

export default defineComponent({
  name: 'MissionsView',
  emits: ['back'],
  setup(props, { emit }) {
    const missions = ref<Mission[]>([]);
    const isPosting = ref(false);
    const isSubmitting = ref(false);
    const form = ref({ title: '', reward: '', location: '' });
    let unsubscribe: any = null;

    onMounted(() => {
      unsubscribe = db.subscribeMissions((newMissions) => {
        missions.value = newMissions;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    const toggleTake = async (m: Mission) => {
      await db.toggleMissionTaken(m.id, !m.isTaken);
    };

    const submitMission = async () => {
      if (!form.value.title.trim() || !form.value.reward.trim() || !form.value.location.trim() || isSubmitting.value) return;
      isSubmitting.value = true;
      try {
        const profile = db.getProfile();
        const m: Partial<Mission> = {
          title: form.value.title.trim(),
          reward: form.value.reward.trim(),
          location: form.value.location.trim(),
          user: profile.name,
          isTaken: false
        };
        await db.addMission(m);
        form.value = { title: '', reward: '', location: '' };
        isPosting.value = false;
        toast.success("Mission publiée ! ⚡");
      } catch (err: any) {
        toast.error("Erreur lors de la publication.");
      } finally {
        isSubmitting.value = false;
      }
    };

    return () => h('div', { class: "flex flex-col min-h-full bg-white dark:bg-background-dark" }, [
      h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 ios-blur px-5 py-4 border-b border-primary/10 flex items-center gap-4" }, [
        h('button', { onClick: () => emit('back'), class: "w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center" }, [
          h('span', { class: "material-icons-round" }, 'arrow_back')
        ]),
        h('h1', { class: "text-xl font-bold" }, 'Missions Campus')
      ]),

      h('div', { class: "p-4 space-y-4 pb-28" }, [
        // Banner info
        h('div', { class: "bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-[28px] mb-2" }, [
          h('div', { class: "flex items-center gap-3 mb-2" }, [
            h('div', { class: "w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shrink-0" }, [
              h('span', { class: "material-icons-round" }, 'bolt')
            ]),
            h('p', { class: "font-black text-sm text-emerald-600" }, "Besoin d'un service rapide ?")
          ]),
          h('p', { class: "text-xs text-slate-500 dark:text-slate-400" }, "Poste ta mission, un camarade l'accepte et tu le paies. Simple et rapide !")
        ]),

        // Liste missions
        ...missions.value.map(m => h('div', {
          key: m.id,
          class: `bg-white dark:bg-slate-900 border rounded-[30px] p-5 shadow-sm flex items-center gap-4 transition-all ${m.isTaken ? 'border-emerald-200 dark:border-emerald-800/40 opacity-60' : 'border-slate-100 dark:border-white/5'}`
        }, [
          h('div', { class: "flex-1 min-w-0" }, [
            h('div', { class: "flex items-center gap-2 mb-1 flex-wrap" }, [
              h('span', { class: "text-[10px] font-black text-emerald-500 uppercase tracking-widest" }, m.reward),
              h('span', { class: "text-[10px] opacity-30" }, '•'),
              h('span', { class: "text-[10px] opacity-40 font-bold" }, formatRelativeDate(m.createdAt || m.time)),
              m.isTaken ? h('span', { class: "text-[9px] font-black bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded-full uppercase" }, 'Pris') : null
            ]),
            h('h4', { class: "font-black text-base leading-tight mb-2" }, m.title),
            h('div', { class: "flex items-center gap-2 opacity-50 text-[10px] font-bold" }, [
              h('span', { class: "material-icons-round text-xs" }, 'location_on'),
              m.location
            ])
          ]),
          h('button', {
            onClick: () => toggleTake(m),
            class: `font-black px-4 py-3 rounded-2xl shadow-lg text-xs active:scale-95 transition-all ${m.isTaken ? 'bg-slate-100 dark:bg-white/5 text-slate-400 shadow-none' : 'bg-emerald-500 text-white shadow-emerald-500/20'}`
          }, m.isTaken ? 'Libérer' : 'Prendre')
        ]))
      ]),

      // Modale ajout de mission
      isPosting.value ? h('div', { class: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center" }, [
        h('div', { class: "bg-white dark:bg-[#1a1d23] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-6 pb-12 sm:pb-6 flex flex-col gap-4" }, [
          h('div', { class: "flex items-center justify-between" }, [
            h('h3', { class: "text-xl font-black" }, "Nouvelle Mission"),
            h('button', { onClick: () => isPosting.value = false, class: "p-2 opacity-40" }, [h('span', { class: "material-icons-round" }, 'close')])
          ]),
          ...[
            { key: 'title', placeholder: "Ex: Ramener une eau glacée à l'amphi", label: 'Mission' },
            { key: 'reward', placeholder: "Ex: 300F CFA", label: 'Récompense' },
            { key: 'location', placeholder: "Ex: Amphi 1000", label: 'Lieu' },
          ].map(field => h('div', { class: "flex flex-col gap-1" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40" }, field.label),
            h('input', {
              value: (form.value as any)[field.key],
              onInput: (e: any) => (form.value as any)[field.key] = e.target.value,
              placeholder: field.placeholder,
              class: "bg-slate-50 dark:bg-white/5 rounded-2xl px-4 py-4 text-sm font-medium border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-emerald-400/30 outline-none dark:text-white"
            })
          ])),
          h('button', {
            onClick: submitMission,
            disabled: !form.value.title.trim() || !form.value.reward.trim() || !form.value.location.trim() || isSubmitting.value,
            class: "w-full bg-emerald-500 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 disabled:opacity-20 active:scale-95 transition-all flex items-center justify-center gap-2"
          }, isSubmitting.value ? [
            h('div', { class: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Publication..."
          ] : "Poster la mission")
        ])
      ]) : null,

      // FAB
      h('button', {
        onClick: () => isPosting.value = true,
        class: "fixed bottom-24 right-6 w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-95 transition-transform shadow-emerald-500/30"
      }, [h('span', { class: "material-icons-round text-3xl" }, 'add')])
    ]);
  }
});
