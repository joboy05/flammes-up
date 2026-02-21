
import { defineComponent, ref, onMounted, h } from 'vue';
import { FaceMatchItem } from '../types';

export default defineComponent({
  name: 'LeaderboardView',
  emits: ['back'],
  setup(props, { emit }) {
    const topStudents = ref<FaceMatchItem[]>([
      { id: '3', name: 'Sarah M.', faculty: 'FSS', flames: 2100, image: 'assets/avatar-2.svg' },
      { id: '4', name: 'Aicha K.', faculty: 'FA', flames: 1560, image: 'assets/avatar-2.svg' },
      { id: '1', name: 'Zainab B.', faculty: 'FLASH', flames: 1245, image: 'assets/avatar-2.svg' },
      { id: '2', name: 'Karim L.', faculty: 'FDSP', flames: 890, image: 'assets/avatar-1.svg' },
    ]);

    onMounted(() => {
      const savedVibes = localStorage.getItem('up_facematch_vibes');
      if (savedVibes) {
        const parsedVibes = JSON.parse(savedVibes);
        topStudents.value = topStudents.value.map(item => ({
          ...item,
          flames: parsedVibes[item.id] || item.flames
        })).sort((a, b) => b.flames - a.flames);
      }
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
             h('img', { src: student.image, class: "w-14 h-14 rounded-full border-2 border-primary/20 object-cover" }),
             idx === 0 ? h('span', { class: "absolute -top-1 -right-1 material-icons-round text-yellow-500 text-xl" }, 'workspace_premium') : null
          ]),
          h('div', { class: "flex-1" }, [
            h('h3', { class: "font-black text-lg" }, student.name),
            h('p', { class: "text-[10px] font-bold text-primary uppercase" }, student.faculty)
          ]),
          h('div', { class: "text-right" }, [
            h('div', { class: "flex items-center justify-end gap-1 text-primary" }, [
               h('span', { class: "material-icons-round text-lg" }, 'whatshot'),
               h('span', { class: "font-black" }, student.flames)
            ]),
            h('p', { class: "text-[9px] font-medium opacity-40 uppercase" }, "Vibes")
          ])
        ]))
      ])
    ]);
  }
});
