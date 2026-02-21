
import { defineComponent, ref, h, watch, onMounted, onUnmounted } from 'vue';
import PostCard from '../components/PostCard';
import AudioRecorder from '../components/AudioRecorder';
import { db } from '../services/db';
import { Post } from '../types';

export default defineComponent({
  name: 'FeedView',
  props: {
    isEcoMode: { type: Boolean, required: true }
  },
  setup(props) {
    const posts = ref<Post[]>([]);
    const isPosting = ref(false);
    const postingTab = ref<'text' | 'audio' | 'image'>('text');
    const newPostContent = ref('');
    const recordedAudio = ref<any>(null);
    let unsubscribe: any = null;

    onMounted(() => {
      unsubscribe = db.subscribePosts((newPosts) => {
        posts.value = newPosts;

        // Si vide, on ajoute peut-être un post de bienvenue (optionnel)
        if (newPosts.length === 0) {
          // On pourrait ajouter le post par défaut ici via db.addPost
        }
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    const handleAudioRecorded = (data: any) => {
      recordedAudio.value = data;
    };

    const submitPost = async () => {
      const user = db.getProfile();

      const postData: Partial<Post> = {
        author: user.name,
        authorTag: user.faculty,
        avatar: user.avatar || 'assets/default-avatar.svg',
        time: "À l'instant",
        content: newPostContent.value || (postingTab.value === 'audio' ? "Note vocale" : ""),
        type: postingTab.value,
        stats: { flames: 0, comments: 0 },
        commentsList: [],
        audioData: recordedAudio.value?.data,
        audioDuration: recordedAudio.value?.duration
      };

      await db.addPost(postData);
      resetPosting();
    };

    const resetPosting = () => {
      newPostContent.value = '';
      recordedAudio.value = null;
      isPosting.value = false;
      postingTab.value = 'text';
    };

    return () => h('div', { class: "flex flex-col min-h-full pb-20" }, [
      // ... stories ...
      h('div', { class: "px-5 py-6 flex gap-4 overflow-x-auto no-scrollbar bg-white dark:bg-transparent" }, [
        h('button', {
          onClick: () => (window as any).dispatchEvent(new CustomEvent('nav', { detail: 'facematch' })),
          class: "flex flex-col items-center gap-2 shrink-0 group"
        }, [
          h('div', { class: "w-16 h-16 rounded-[22px] p-0.5 bg-gradient-to-tr from-primary to-rose-400 group-active:scale-90 transition-all shadow-xl" }, [
            h('div', { class: "w-full h-full rounded-[20px] border-2 border-white dark:border-[#0f1115] overflow-hidden bg-slate-100 flex items-center justify-center" }, [
              h('span', { class: "material-icons-round text-primary text-3xl" }, 'face')
            ])
          ]),
          h('span', { class: "text-[10px] font-black uppercase tracking-widest text-primary" }, 'FaceMatch')
        ]),
        [1, 2, 3].map(i => h('div', { key: i, class: "flex flex-col items-center gap-2 shrink-0" }, [
          h('div', { class: "w-16 h-16 rounded-[22px] p-0.5 border border-slate-200 dark:border-white/10" }, [
            h('img', { src: 'assets/campus-story.svg', class: "w-full h-full rounded-[20px] object-cover opacity-60" })
          ]),
          h('span', { class: "text-[10px] font-bold opacity-30 uppercase tracking-widest" }, 'Campus')
        ]))
      ]),

      // Posts
      h('div', { class: "p-4 space-y-4" },
        posts.value.map(post => h(PostCard, {
          key: post.id,
          post,
          isEcoMode: props.isEcoMode,
          onFlame: () => {
            const isFlambant = !post.stats.isFlambant;
            db.updatePost(post.id, {
              stats: {
                ...post.stats,
                isFlambant,
                flames: post.stats.flames + (isFlambant ? 1 : -1)
              }
            });
          },
          onUpdatePost: (updated) => {
            db.updatePost(post.id, updated);
          }
        }))
      ),

      // Modal
      isPosting.value ? h('div', { class: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in" }, [
        h('div', { class: "bg-white dark:bg-[#1a1d23] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-6 pb-12 sm:pb-6 shadow-2xl flex flex-col gap-5 animate-in slide-in-from-bottom" }, [
          h('div', { class: "flex items-center justify-between" }, [
            h('h3', { class: "text-xl font-black" }, "Nouveau Post"),
            h('button', { onClick: resetPosting, class: "p-2 opacity-50" }, [h('span', { class: "material-icons-round" }, 'close')])
          ]),

          h('div', { class: "flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl" }, [
            { id: 'text', icon: 'notes', label: 'Texte' },
            { id: 'audio', icon: 'mic', label: 'Audio' }
          ].map(t => h('button', {
            onClick: () => postingTab.value = t.id as any,
            class: `flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${postingTab.value === t.id ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'opacity-40'}`
          }, [h('span', { class: "material-icons-round text-lg" }, t.icon), t.label]))),

          postingTab.value === 'text' ? h('textarea', {
            value: newPostContent.value,
            onInput: (e: any) => newPostContent.value = e.target.value,
            placeholder: "Quoi de neuf sur le campus ?",
            class: "w-full h-32 bg-transparent border-none p-0 text-lg font-medium focus:ring-0 resize-none dark:text-white"
          }) : h(AudioRecorder, { onRecorded: handleAudioRecorded }),

          recordedAudio.value && postingTab.value === 'audio' ? h('div', { class: "flex items-center gap-3 bg-primary/10 p-4 rounded-2xl border border-primary/20" }, [
            h('span', { class: "material-icons-round text-primary" }, 'check_circle'),
            h('p', { class: "text-[10px] font-black uppercase text-primary" }, `Audio prêt : ${recordedAudio.value.duration}`),
            h('button', { onClick: () => recordedAudio.value = null, class: "ml-auto" }, [h('span', { class: "material-icons-round opacity-30" }, 'delete')])
          ]) : null,

          h('button', {
            onClick: submitPost,
            disabled: (postingTab.value === 'text' && !newPostContent.value.trim()) || (postingTab.value === 'audio' && !recordedAudio.value),
            class: "w-full bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 disabled:opacity-20 active:scale-95 transition-all"
          }, "Publier l'étincelle")
        ])
      ]) : null,

      h('button', {
        onClick: () => isPosting.value = true,
        class: "fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-95 transition-transform"
      }, [h('span', { class: "material-icons-round text-4xl" }, 'add')])
    ]);
  }
});
