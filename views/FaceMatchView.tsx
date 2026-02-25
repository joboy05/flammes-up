import { defineComponent, ref, onMounted, onUnmounted, h } from 'vue';
import { db } from '../services/db';
import { UserProfile } from '../types';

export default defineComponent({
  name: 'FaceMatchView',
  props: { userVibes: Number },
  emits: ['back'],
  setup(props, { emit }) {
    const items = ref<UserProfile[]>([]);
    const activeIndex = ref(0);
    const votedIds = ref<Set<string>>(new Set());
    let unsubscribe: any = null;

    onMounted(() => {
      const saved = sessionStorage.getItem('up_facematch_votes');
      if (saved) votedIds.value = new Set(JSON.parse(saved));
      unsubscribe = db.subscribeUsers((users) => {
        const studentExamples: UserProfile[] = [
          {
            name: 'Bhilal',
            phone: 'example-bhial',
            faculty: 'Droit',
            level: 'Licence 3',
            residence: 'BADEA-A',
            maritalStatus: 'celibataire',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
            bio: 'Fan de sport et de bonne humeur !',
            vibesReceived: 12,
            upPoints: 450,
            hasStory: true,
            role: 'user'
          },
          {
            name: 'Emmanuel',
            phone: 'example-emmanuel',
            faculty: 'FLASH',
            level: 'Master 1',
            residence: 'externe',
            maritalStatus: 'en_couple',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
            bio: 'Étudiant passionné par la tech.',
            vibesReceived: 8,
            upPoints: 320,
            hasStory: false,
            role: 'user'
          },
          {
            name: 'Hardy Junior',
            phone: 'example-hardy',
            faculty: 'FSA',
            level: 'Licence 2',
            residence: 'Mohamed-VI',
            maritalStatus: 'non_defini',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
            bio: 'Toujours prêt pour une nouvelle aventure.',
            vibesReceived: 15,
            upPoints: 500,
            hasStory: true,
            role: 'user'
          }
        ];

        // Merge Firestore users with examples
        items.value = [...studentExamples, ...users.filter(u => !studentExamples.some(e => e.phone === u.phone))];
        items.value = items.value.sort(() => 0.5 - Math.random());
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    const next = () => {
      if (activeIndex.value < items.value.length - 1) activeIndex.value++;
      else activeIndex.value = 0;
    };

    const handleVote = async (userId: string) => {
      if (votedIds.value.has(userId)) {
        return next();
      }

      const student = items.value.find(i => i.phone === userId);

      // Animation "pop" sur le vote
      const el = document.querySelector('.active-card');
      if (el) {
        anime({
          targets: el,
          scale: [1, 1.1, 0],
          rotate: [0, 5, -10],
          opacity: [1, 1, 0],
          duration: 800,
          easing: 'easeInBack',
          complete: async () => {
            if (student) {
              votedIds.value.add(userId);
              sessionStorage.setItem('up_facematch_votes', JSON.stringify([...votedIds.value]));
              await db.updateProfile(userId, { vibesReceived: (student.vibesReceived || 0) + 1 });
            }
            next();
          }
        });
      } else {
        if (student) {
          votedIds.value.add(userId);
          sessionStorage.setItem('up_facematch_votes', JSON.stringify([...votedIds.value]));
          await db.updateProfile(userId, { vibesReceived: (student.vibesReceived || 0) + 1 });
        }
        next();
      }
    };

    return () => h('div', { class: "min-h-screen bg-[#0f1115] text-white flex flex-col overflow-hidden" }, [
      h('header', { class: "p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/60 to-transparent" }, [
        h('button', { onClick: () => emit('back'), class: "w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10 active:scale-90 transition-all" }, [
          h('span', { class: "material-icons-round" }, 'arrow_back')
        ]),
        h('div', { class: "text-center" }, [
          h('h1', { class: "text-lg font-black tracking-tight" }, 'Face Match UP'),
          h('div', { class: "flex items-center justify-center gap-2 mt-1" }, [
            h('span', { class: "text-[9px] font-black text-primary uppercase tracking-[0.2em]" }, 'Tes Vibes :'),
            h('span', { class: "text-[10px] font-black bg-primary px-2 py-0.5 rounded-full shadow-lg" }, props.userVibes)
          ])
        ]),
        h('button', { class: "w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(238,43,43,0.3)] active:scale-90 transition-all" }, [
          h('span', { class: "material-icons-round" }, 'add_a_photo')
        ])
      ]),

      h('div', { class: "flex-1 relative flex items-center justify-center px-6 pb-20" }, [
        items.value.map((item, idx) => h('div', {
          class: [
            "absolute inset-x-6 aspect-[3/4.5] rounded-[50px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-700 ease-out border border-white/5",
            idx === activeIndex.value ? "opacity-100 scale-100 rotate-0 z-20 active-card" :
              idx < activeIndex.value ? "opacity-0 -translate-y-20 scale-110 -rotate-12 z-10" : "opacity-0 translate-y-20 scale-90 rotate-12 z-10"
          ]
        }, [
          h('div', { class: "w-full h-full bg-slate-800 flex items-center justify-center" }, [
            h('img', { src: item.avatar || '/assets/default-avatar.svg', class: "w-full h-full object-cover" })
          ]),
          h('div', { class: "absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" }),
          h('div', { class: "absolute bottom-12 left-8 right-8" }, [
            h('h2', { class: "text-4xl font-black mb-1 drop-shadow-2xl" }, item.name),
            h('p', { class: "text-lg font-bold text-primary mb-10" }, item.faculty),

            h('div', { class: "flex items-center gap-4" }, [
              h('button', {
                onClick: next,
                class: "flex-1 h-16 bg-white/10 backdrop-blur-xl rounded-[28px] flex items-center justify-center border border-white/10 active:scale-95 transition-all"
              }, [
                h('span', { class: "material-icons-round text-3xl opacity-60" }, 'close')
              ]),
              h('button', {
                onClick: () => handleVote(item.phone),
                class: "flex-[2] h-16 bg-primary rounded-[28px] flex items-center justify-center gap-3 shadow-[0_20px_40_rgba(238,43,43,0.4)] active:scale-105 transition-all"
              }, [
                h('span', { class: "material-icons-round text-2xl" }, 'whatshot'),
                h('span', { class: "font-black text-xs uppercase tracking-widest" }, 'VIBE !')
              ])
            ])
          ])
        ]))
      ])
    ]);
  }
});