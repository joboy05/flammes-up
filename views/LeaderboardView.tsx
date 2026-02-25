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

      h('div', { class: "p-6 -mt-6 space-y-4" }, [
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
      ])
    ]);
  }
});
