import { defineComponent, ref, onMounted, onUnmounted, h } from 'vue';
import { db } from '../services/db';
import { UserProfile } from '../types';

export default defineComponent({
  name: 'LeaderboardView',
  emits: ['back'],
  setup(props, { emit }) {
    const topStudents = ref<UserProfile[]>([]);
    let unsubscribe: any = null;

    onMounted(() => {
      unsubscribe = db.subscribeLeaderboard((users) => {
        topStudents.value = users;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    return () => h('div', { class: "min-h-full bg-white dark:bg-[#0f1115] flex flex-col" }, [
      h('header', { class: "px-6 py-12 bg-primary rounded-b-[40px] text-white shadow-2xl relative overflow-hidden" }, [
        h('div', { class: "absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" }),
        h('button', { onClick: () => emit('back'), class: "mb-6 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md active:scale-95" }, [
          h('span', { class: "material-icons-round" }, 'arrow_back')
        ]),
        h('h1', { class: "text-3xl font-black tracking-tighter" }, "Les Flambants"),
        h('p', { class: "text-white/70 text-sm font-bold uppercase tracking-widest mt-1" }, "Top du Campus Parakou")
      ]),

      h('div', { class: "p-6 -mt-10 overflow-x-auto no-scrollbar" }, [
        topStudents.value.length > 0 ? h('div', {
          class: "bg-gradient-to-br from-amber-400 to-orange-600 p-6 rounded-[40px] shadow-2xl shadow-orange-500/30 text-white flex items-center gap-6 relative overflow-hidden mb-6"
        }, [
          h('div', { class: "absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-10 -mt-10 blur-xl" }),
          h('div', { class: "relative" }, [
            h('img', {
              src: topStudents.value[0].avatar || '/assets/default-avatar.svg',
              class: "w-24 h-24 rounded-full border-4 border-white/50 object-cover shadow-2xl"
            }),
            h('div', { class: "absolute -bottom-2 -right-2 bg-white text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg shadow-black/20" }, "FLAMER #1")
          ]),
          h('div', { class: "flex-1" }, [
            h('p', { class: "text-[10px] font-black uppercase tracking-[0.2em] opacity-80" }, "L'Étincelle du Mois"),
            h('h2', { class: "text-2xl font-black leading-tight mt-1" }, topStudents.value[0].name),
            h('div', { class: "flex items-center gap-2 mt-3" }, [
              h('div', { class: "bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase backdrop-blur-md" }, topStudents.value[0].faculty),
              h('div', { class: "flex items-center gap-1 font-black" }, [
                h('span', { class: "material-icons-round text-sm" }, 'whatshot'),
                topStudents.value[0].vibesReceived
              ])
            ])
          ])
        ]) : null,
      ]),
      topStudents.value.map((student, idx) => h('div', {
        class: "bg-white dark:bg-primary/5 border border-primary/10 p-4 rounded-[28px] flex items-center gap-4 shadow-sm"
      }, [
        h('div', { class: "w-10 h-10 flex items-center justify-center font-black text-xl italic text-primary/30" }, `#${idx + 1}`),
        h('div', { class: "relative" }, [
          h('img', {
            src: student.avatar || '/assets/default-avatar.svg',
            class: "w-14 h-14 rounded-full border-2 border-primary/20 object-cover bg-slate-100"
          }),
          idx === 0 ? h('span', { class: "absolute -top-1 -right-1 material-icons-round text-yellow-500 text-xl" }, 'workspace_premium') : null
        ]),
        h('div', { class: "flex-1" }, [
          h('h3', { class: "font-black text-lg" }, student.name),
          h('p', { class: "text-[10px] font-bold text-primary uppercase" }, student.faculty)
        ]),
        h('div', { class: "text-right" }, [
          h('div', { class: "flex items-center justify-end gap-1 text-primary" }, [
            h('span', { class: "material-icons-round text-lg" }, 'whatshot'),
            h('span', { class: "font-black" }, student.vibesReceived)
          ]),
          h('p', { class: "text-[9px] font-medium opacity-40 uppercase" }, "Vibes")
        ])
      ]))
    ]);
  }
});
