import { defineComponent, ref, h } from 'vue';
import { formatRelativeDate } from '../services/dates';

export default defineComponent({
  name: 'PostCard',
  props: {
    post: { type: Object, required: true },
    isEcoMode: { type: Boolean, required: true },
    canDelete: { type: Boolean, default: false }
  },
  emits: ['flame', 'updatePost', 'delete'],
  setup(props, { emit }) {
    const showComments = ref(false);
    const newComment = ref('');
    const comments = ref(props.post.commentsList || []);
    const isPlaying = ref(false);
    const audioRef = ref<HTMLAudioElement | null>(null);

    const togglePlay = () => {
      if (!audioRef.value) return;
      if (isPlaying.value) audioRef.value.pause();
      else audioRef.value.play();
      isPlaying.value = !isPlaying.value;
    };

    const addComment = () => {
      if (!newComment.value.trim()) return;
      const user = JSON.parse(localStorage.getItem('up_profile') || '{}');

      const comment = {
        id: Date.now().toString(),
        author: user.name || 'Étudiant UP',
        avatar: user.avatar || '/assets/default-avatar.svg',
        text: newComment.value,
        createdAt: new Date()
      };

      comments.value.unshift(comment);
      newComment.value = '';

      emit('updatePost', {
        ...props.post,
        commentsList: comments.value,
        stats: {
          ...props.post.stats,
          comments: comments.value.length
        }
      });
    };

    return () => h('article', {
      class: "bg-white dark:bg-[#1a1d23] border border-slate-100 dark:border-white/5 rounded-[32px] p-5 shadow-sm mb-4"
    }, [
      h('div', { class: "flex items-center justify-between mb-4" }, [
        h('div', { class: "flex items-center gap-3" }, [
          h('div', { class: "relative" }, [
            h('img', { src: props.post.avatar || '/assets/default-avatar.svg', class: "w-11 h-11 rounded-full object-cover border-2 border-primary/20" }),
          ]),
          h('div', [
            h('p', { class: "font-bold text-sm" }, props.post.author),
            h('p', { class: "text-[10px] opacity-40 font-bold uppercase tracking-widest" }, `${props.post.time} • ${props.post.authorTag || 'Campus'}`)
          ])
        ]),
        h('button', { 
          class: "text-slate-300" 
        }, [
          h('span', { class: "material-icons-round" }, 'more_horiz')
        ]),
        props.canDelete ? h('button', {
          onClick: () => emit('delete'),
          class: "text-red-500 ml-2"
        }, [
          h('span', { class: "material-icons-round" }, 'delete')
        ]) : null
      ]),

      h('p', { class: "text-sm leading-relaxed mb-5 text-slate-800 dark:text-slate-200 font-medium" }, props.post.content),

      // Audio Player
      props.post.type === 'audio' && props.post.audioData ? h('div', { class: "mb-6 bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4" }, [
        h('audio', { ref: audioRef, src: props.post.audioData, onEnded: () => isPlaying.value = false, class: "hidden" }),
        h('button', {
          onClick: togglePlay,
          class: "w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        }, [
          h('span', { class: "material-icons-round" }, isPlaying.value ? 'pause' : 'play_arrow')
        ]),
        h('div', { class: "flex-1" }, [
          h('div', { class: "h-1 bg-primary/10 rounded-full overflow-hidden" }, [
            h('div', { class: "h-full bg-primary transition-all duration-300", style: { width: isPlaying.value ? '100%' : '0%' } })
          ]),
          h('div', { class: "flex justify-between mt-2" }, [
            h('span', { class: "text-[9px] font-black uppercase text-primary" }, isPlaying.value ? "En lecture..." : "Note Vocale"),
            h('span', { class: "text-[9px] font-black opacity-40" }, props.post.audioDuration || '0:00')
          ])
        ])
      ]) : null,

      props.post.type === 'image' && props.post.image ? h('img', { src: props.post.image, class: "w-full rounded-2xl mb-4" }) : null,

      h('div', { class: "flex items-center gap-6 border-t border-slate-50 dark:border-white/5 pt-4" }, [
        h('button', {
          onClick: () => emit('flame'),
          class: ["flex items-center gap-2 transition-all duration-150 active:scale-110", props.post.stats?.isFlambant ? 'text-red-500' : 'text-slate-400 hover:text-primary']
        }, [
          h('span', { class: "material-icons-round text-2xl transition-transform duration-150" }, props.post.stats?.isFlambant ? 'local_fire_department' : 'whatshot'),
          h('span', { class: "text-xs font-black" }, props.post.stats?.flames || 0)
        ]),
        h('button', {
          onClick: () => showComments.value = !showComments.value,
          class: "flex items-center gap-2 text-slate-400 active:scale-110 transition-all"
        }, [
          h('span', { class: "material-icons-round text-2xl" }, 'chat_bubble_outline'),
          h('span', { class: "text-xs font-black" }, comments.value.length)
        ]),
        h('button', { class: "flex items-center gap-2 text-slate-400 ml-auto" }, [
          h('span', { class: "material-icons-round text-2xl" }, 'ios_share')
        ])
      ]),

      showComments.value ? h('div', { class: "mt-6 pt-4 border-t border-slate-50 dark:border-white/5 space-y-4" }, [
        h('div', { class: "flex gap-3 bg-slate-50 dark:bg-white/5 rounded-2xl p-2 px-4" }, [
          h('input', {
            value: newComment.value,
            onInput: (e: any) => newComment.value = e.target.value,
            onKeyup: (e: any) => e.key === 'Enter' && addComment(),
            placeholder: "Ton commentaire...",
            class: "flex-1 bg-transparent border-none text-xs focus:ring-0 py-2 dark:text-white"
          }),
          h('button', { onClick: addComment, class: "text-primary font-black text-[10px] uppercase tracking-widest px-2" }, "OK")
        ]),
        h('div', { class: "space-y-4 max-h-60 overflow-y-auto no-scrollbar" },
          comments.value.map(c => h('div', { class: "flex gap-3" }, [
            h('img', { src: c.avatar || '/assets/default-avatar.svg', class: "w-8 h-8 rounded-full object-cover" }),
            h('div', { class: "flex-1 bg-slate-50 dark:bg-white/5 rounded-2xl p-3" }, [
              h('p', { class: "text-[10px] font-black uppercase tracking-widest text-primary mb-1" }, c.author),
              h('p', { class: "text-xs font-medium opacity-80" }, c.text),
              h('p', { class: "text-[8px] opacity-30 font-bold mt-2" }, formatRelativeDate(c.createdAt || c.time))
            ])
          ]))
        )
      ]) : null
    ]);
  }
});