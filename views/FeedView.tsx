
import { defineComponent, ref, h, watch, onMounted, onUnmounted } from 'vue';
import PostCard from '../components/PostCard';
import AudioRecorder from '../components/AudioRecorder';
import { db } from '../services/db';
import { Post, Story } from '../types';

export default defineComponent({
  name: 'FeedView',
  props: {
    isEcoMode: { type: Boolean, required: true }
  },
  setup(props) {
    const posts = ref<Post[]>([]);
    const stories = ref<Story[]>([]);
    const isPosting = ref(false);
    const isPostingStory = ref(false);
    const postingTab = ref<'text' | 'audio' | 'image'>('text');
    const newPostContent = ref('');
    const recordedAudio = ref<any>(null);
    const newStoryContent = ref(''); // Base64 data
    const newStoryType = ref<'image' | 'video'>('image');
    const selectedStory = ref<Story | null>(null);
    let unsubscribe: any = null;
    let unsubscribeStories: any = null;

    onMounted(() => {
      unsubscribe = db.subscribePosts((newPosts) => {
        posts.value = newPosts;
      });
      unsubscribeStories = db.subscribeStories((newStories) => {
        stories.value = newStories;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
      if (unsubscribeStories) unsubscribeStories();
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

    const submitStory = async () => {
      const user = db.getProfile();
      if (!newStoryContent.value) return;

      const storyData: Partial<Story> = {
        userId: user.phone,
        name: user.name,
        avatar: user.avatar || 'assets/default-avatar.svg',
        content: newStoryContent.value,
        type: newStoryType.value,
      };

      await db.addStory(storyData);
      resetStoryPosting();
    };

    const resetStoryPosting = () => {
      newStoryContent.value = '';
      isPostingStory.value = false;
    };

    const resetPosting = () => {
      newPostContent.value = '';
      recordedAudio.value = null;
      isPosting.value = false;
      postingTab.value = 'text';
    };

    return () => h('div', { class: "flex flex-col min-h-full pb-20" }, [
      // Horizontal Stories Bar
      h('div', { class: "px-5 py-6 flex gap-4 overflow-x-auto no-scrollbar bg-white dark:bg-transparent" }, [
        // Add Story Button
        h('button', {
          onClick: () => isPostingStory.value = true,
          class: "flex flex-col items-center gap-2 shrink-0 group"
        }, [
          h('div', { class: "w-16 h-16 rounded-[22px] border-2 border-dashed border-primary/40 flex items-center justify-center group-active:scale-95 transition-all bg-primary/5" }, [
            h('span', { class: "material-icons-round text-primary" }, 'add')
          ]),
          h('span', { class: "text-[10px] font-black uppercase tracking-widest text-primary" }, 'Ma Story')
        ]),

        // Real Stories
        stories.value.map(s => h('button', {
          key: s.id,
          onClick: () => selectedStory.value = s,
          class: "flex flex-col items-center gap-2 shrink-0 group"
        }, [
          h('div', { class: "w-16 h-16 rounded-[22px] p-0.5 bg-gradient-to-tr from-primary via-orange-500 to-rose-400 group-active:scale-90 transition-all shadow-lg" }, [
            h('div', { class: "w-full h-full rounded-[20px] border-2 border-white dark:border-[#0f1115] overflow-hidden bg-slate-100" }, [
              h('img', {
                src: s.content || 'assets/campus-story.svg',
                class: "w-full h-full object-cover"
              })
            ])
          ]),
          h('span', { class: "text-[10px] font-bold opacity-60 uppercase tracking-widest truncate w-16" }, s.name.split(' ')[0])
        ])),

        // FaceMatch shortcut
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
        ])
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

      // Story Creator Modal
      isPostingStory.value ? h('div', { class: "fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in duration-300" }, [
        h('div', { class: "w-full max-w-sm bg-white dark:bg-[#1a1d23] rounded-[40px] p-8 space-y-6" }, [
          h('h3', { class: "text-2xl font-black text-center" }, "Nouvelle Étincelle"),
          h('div', {
            onClick: () => (document.getElementById('story-file-input') as HTMLInputElement).click(),
            class: "aspect-[9/16] bg-slate-100 dark:bg-white/5 rounded-[30px] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative"
          }, [
            newStoryContent.value ? (
              newStoryType.value === 'image'
                ? h('img', { src: newStoryContent.value, class: "absolute inset-0 w-full h-full object-cover" })
                : h('video', { src: newStoryContent.value, class: "absolute inset-0 w-full h-full object-cover", autoplay: true, muted: true, loop: true })
            ) : [
              h('span', { class: "material-icons-round text-5xl text-primary mb-4" }, 'add_a_photo'),
              h('p', { class: "text-xs font-bold opacity-40 uppercase tracking-widest" }, "Photos ou Vidéos")
            ],
            h('input', {
              id: 'story-file-input',
              type: 'file',
              accept: 'image/*,video/*',
              class: "hidden",
              onChange: (e: any) => {
                const file = e.target.files[0];
                if (file) {
                  const type = file.type.startsWith('video') ? 'video' : 'image';
                  newStoryType.value = type;
                  const reader = new FileReader();
                  reader.onload = (re) => newStoryContent.value = re.target?.result as string;
                  reader.readAsDataURL(file);
                }
              }
            })
          ]),
          h('div', { class: "flex gap-3" }, [
            h('button', { onClick: resetStoryPosting, class: "flex-1 py-4 font-black uppercase text-[10px] tracking-widest opacity-40" }, "Annuler"),
            h('button', {
              onClick: submitStory,
              disabled: !newStoryContent.value,
              class: "flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 disabled:opacity-20"
            }, "Propager")
          ])
        ])
      ]) : null,

      // Story Viewer Modal
      selectedStory.value ? h('div', {
        onClick: () => selectedStory.value = null,
        class: "fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-in fade-in"
      }, [
        h('div', { class: "absolute top-0 left-0 right-0 p-8 flex items-center gap-4 z-10 bg-gradient-to-b from-black/60 to-transparent" }, [
          h('div', { class: "w-10 h-10 rounded-full border-2 border-primary overflow-hidden" }, [
            h('img', { src: selectedStory.value.avatar, class: "w-full h-full object-cover" })
          ]),
          h('div', [
            h('p', { class: "text-white font-black text-sm" }, selectedStory.value.name),
            h('p', { class: "text-white/60 text-[8px] font-bold uppercase tracking-widest" }, "24h Story")
          ]),
          h('button', { class: "ml-auto text-white" }, [h('span', { class: "material-icons-round font-black" }, 'close')])
        ]),
        selectedStory.value.type === 'image'
          ? h('img', {
            src: selectedStory.value.content,
            class: "w-full h-full object-contain"
          })
          : h('video', {
            src: selectedStory.value.content,
            class: "w-full h-full object-contain",
            autoplay: true,
            playsinline: true,
            loop: true
          }),
        h('div', { class: "absolute bottom-0 left-0 right-0 h-1 bg-white/20" }, [
          h('div', { class: "h-full bg-primary animate-story-progress" })
        ])
      ]) : null,

      // Post Modal
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
