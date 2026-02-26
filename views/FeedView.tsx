
import { defineComponent, ref, h, onMounted, onUnmounted } from 'vue';
import PostCard from '../components/PostCard';
import AudioRecorder from '../components/AudioRecorder';
import { api } from '../services/api';
import { ws } from '../services/socket';
import { toast } from '../services/toast';
import { formatRelativeDate } from '../services/dates';
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
    const newStoryContent = ref('');
    const newStoryType = ref<'image' | 'video'>('image');
    const selectedStory = ref<Story | null>(null);
    const isLoadingPosts = ref(true);
    const isSubmittingPost = ref(false);
    const isSubmittingStory = ref(false);

    const loadPosts = async () => {
      try {
        const data = await api.getPosts();
        const user = JSON.parse(localStorage.getItem('up_profile') || '{}');
        console.log('Current user phone:', user.phone);
        
        posts.value = (data.posts || []).map((p: any) => {
          // Vérifier si l'utilisateur actuel a flambé ce post
          const isFlambant = p.flamedBy?.includes(user.phone) || false;
          // Vérifier si l'utilisateur est l'auteur du post
          const canDelete = p.userId === user.phone || p.user === user.phone;
          
          console.log('Post:', p.id, 'userId:', p.userId, 'user:', p.user, 'canDelete:', canDelete);
          
          return {
            ...p,
            time: formatRelativeDate(p.createdAt),
            stats: {
              ...p.stats,
              isFlambant
            },
            canDelete
          };
        });
      } catch (err) {
        console.error('Error loading posts:', err);
      } finally {
        isLoadingPosts.value = false;
      }
    };

    const loadStories = async () => {
      try {
        const data = await api.getStories();
        stories.value = data.stories || [];
      } catch (err) {
        console.error('Error loading stories:', err);
      }
    };

    // WebSocket handlers
    const handleNewPost = (post: any) => {
      post.time = formatRelativeDate(post.createdAt);
      // Éviter les doublons
      if (!posts.value.find(p => p.id === post.id)) {
        posts.value.unshift(post);
      }
    };

    const handleUpdatePost = (data: any) => {
      const idx = posts.value.findIndex(p => p.id === data.id);
      if (idx !== -1) {
        posts.value[idx] = { ...posts.value[idx], ...data };
      }
    };

    const handlePostFlamed = (data: any) => {
      const idx = posts.value.findIndex(p => p.id === data.id);
      if (idx !== -1) {
        const user = JSON.parse(localStorage.getItem('up_profile') || '{}');
        const isFlambant = data.flamedBy?.includes(user.phone) || false;
        posts.value[idx] = { 
          ...posts.value[idx], 
          stats: {
            ...posts.value[idx].stats,
            flames: data.flames,
            isFlambant
          }
        };
      }
    };

    const handlePostDeleted = (data: any) => {
      const idx = posts.value.findIndex(p => p.id === data.id);
      if (idx !== -1) {
        posts.value.splice(idx, 1);
      }
    };

    const handleNewStory = (story: any) => {
      if (!stories.value.find(s => s.id === story.id)) {
        stories.value.push(story);
      }
    };

    onMounted(async () => {
      await Promise.all([loadPosts(), loadStories()]);

      // S'abonner aux events WebSocket
      ws.on('new-post', handleNewPost);
      ws.on('update-post', handleUpdatePost);
      ws.on('post-flamed', handlePostFlamed);
      ws.on('delete-post', handlePostDeleted);
      ws.on('new-story', handleNewStory);
    });

    onUnmounted(() => {
      ws.off('new-post', handleNewPost);
      ws.off('update-post', handleUpdatePost);
      ws.off('post-flamed', handlePostFlamed);
      ws.off('delete-post', handlePostDeleted);
      ws.off('new-story', handleNewStory);
    });

    const handleAudioRecorded = (data: any) => {
      recordedAudio.value = data;
    };

    const submitPost = async () => {
      if (isSubmittingPost.value) return;
      isSubmittingPost.value = true;
      try {
        await api.createPost({
          content: newPostContent.value || (postingTab.value === 'audio' ? "Note vocale" : ""),
          type: postingTab.value,
          audioData: recordedAudio.value?.data,
          audioDuration: recordedAudio.value?.duration
        });
        resetPosting();
        // Recharger les posts pour avoir les données fraîches
        await loadPosts();
      } catch (err: any) {
        toast.error(err.message || 'Erreur lors de la publication');
      } finally {
        isSubmittingPost.value = false;
      }
    };

    const submitStory = async () => {
      if (!newStoryContent.value || isSubmittingStory.value) return;
      isSubmittingStory.value = true;
      try {
        await api.createStory(newStoryContent.value, newStoryType.value);
        resetStoryPosting();
        await loadStories();
        toast.success("Ta flamme se propage ! 🔥");
      } catch (err: any) {
        toast.error(err.message || 'Erreur lors de la publication de la story');
      } finally {
        isSubmittingStory.value = false;
      }
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
        h('button', {
          onClick: () => isPostingStory.value = true,
          class: "flex flex-col items-center gap-2 shrink-0 group"
        }, [
          h('div', { class: "w-16 h-16 rounded-[22px] border-2 border-dashed border-primary/40 flex items-center justify-center group-active:scale-95 transition-all bg-primary/5" }, [
            h('span', { class: "material-icons-round text-primary" }, 'add')
          ]),
          h('span', { class: "text-[10px] font-black uppercase tracking-widest text-primary" }, 'Ma Story')
        ]),

        stories.value.map(s => h('button', {
          key: s.id,
          onClick: () => selectedStory.value = s,
          class: "flex flex-col items-center gap-2 shrink-0 group"
        }, [
          h('div', { class: "w-16 h-16 rounded-[22px] p-0.5 bg-gradient-to-tr from-primary via-orange-500 to-rose-400 group-active:scale-90 transition-all shadow-lg" }, [
            h('div', { class: "w-full h-full rounded-[20px] border-2 border-white dark:border-[#0f1115] overflow-hidden bg-slate-100" }, [
              h('img', {
                src: s.content || '/assets/campus-story.svg',
                class: "w-full h-full object-cover"
              })
            ])
          ]),
          h('span', { class: "text-[10px] font-bold opacity-60 uppercase tracking-widest truncate w-16" }, s.name.split(' ')[0])
        ])),

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

      // Loading state
      isLoadingPosts.value ? h('div', { class: "flex items-center justify-center py-20" }, [
        h('div', { class: "w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" })
      ]) : null,

      // Posts
      !isLoadingPosts.value ? h('div', { class: "p-4 space-y-4" },
        posts.value.length === 0
          ? [h('div', { class: "text-center py-20 opacity-40" }, [
            h('span', { class: "material-icons-round text-5xl mb-4 block" }, 'local_fire_department'),
            h('p', { class: "text-sm font-bold uppercase tracking-widest" }, 'Aucun post encore. Sois le premier ! 🔥')
          ])]
          : posts.value.map(post => h(PostCard, {
            key: post.id,
            post,
            isEcoMode: props.isEcoMode,
            onFlame: async () => {
              try {
                // Optimisation: mise à jour optimiste immédiate
                const postIndex = posts.value.findIndex(p => p.id === post.id);
                if (postIndex === -1) return;
                
                const currentPost = posts.value[postIndex];
                const wasFlamed = currentPost.stats?.isFlambant || false;
                const newFlames = wasFlamed ? 
                  Math.max(0, (currentPost.stats?.flames || 0) - 1) : 
                  (currentPost.stats?.flames || 0) + 1;
                
                // Mise à jour instantanée UI
                posts.value[postIndex] = {
                  ...currentPost,
                  stats: {
                    ...currentPost.stats,
                    flames: newFlames,
                    isFlambant: !wasFlamed
                  }
                };
                
                // Appel API en arrière-plan
                api.flamePost(post.id).catch(err => {
                  // Rollback en cas d'erreur
                  posts.value[postIndex] = currentPost;
                  toast.error(err.message || "Erreur lors du vote");
                });
              } catch (err: any) {
                console.error('Flame error:', err);
                toast.error(err.message || "Erreur lors du vote");
              }
            },
            onUpdatePost: async (updated: any) => {
              try {
                await api.updatePost(post.id, updated);
              } catch (err) {
                console.error('Update post error:', err);
              }
            },
            onDelete: async () => {
              console.log('Delete post clicked:', post.id);
              toast.info('🔧 Système de suppression en cours de développement');
            }
          }))
      ) : null,

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
            isSubmittingStory.value ? h('div', { class: "absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center z-10" }, [
              h('div', { class: "w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" })
            ]) : null,
            h('input', {
              id: 'story-file-input',
              type: 'file',
              accept: 'image/*,video/*',
              class: "hidden",
              onChange: async (e: any) => {
                const file = e.target.files[0];
                if (file) {
                  const type = file.type.startsWith('video') ? 'video' : 'image';
                  newStoryType.value = type;
                  if (type === 'image') {
                    try {
                      const { compressImage } = await import('../services/imageUtils');
                      newStoryContent.value = await compressImage(file, 800, 800, 0.7);
                    } catch (err) {
                      const reader = new FileReader();
                      reader.onload = (re) => newStoryContent.value = re.target?.result as string;
                      reader.readAsDataURL(file);
                    }
                  } else {
                    const reader = new FileReader();
                    reader.onload = (re) => newStoryContent.value = re.target?.result as string;
                    reader.readAsDataURL(file);
                  }
                }
              }
            })
          ]),
          h('div', { class: "flex gap-3" }, [
            h('button', { onClick: resetStoryPosting, class: "flex-1 py-4 font-black uppercase text-[10px] tracking-widest opacity-40" }, "Annuler"),
            h('button', {
              onClick: submitStory,
              disabled: !newStoryContent.value || isSubmittingStory.value,
              class: "flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 disabled:opacity-20 flex items-center justify-center gap-2"
            }, isSubmittingStory.value ? [
              h('div', { class: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
              "Propagation..."
            ] : "Propager")
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
            h('p', { class: "text-white/60 text-[8px] font-bold uppercase tracking-widest" }, formatRelativeDate(selectedStory.value.createdAt))
          ]),
          h('button', { class: "ml-auto text-white" }, [h('span', { class: "material-icons-round font-black" }, 'close')])
        ]),
        selectedStory.value.type === 'image'
          ? h('img', { src: selectedStory.value.content, class: "w-full h-full object-contain" })
          : h('video', { src: selectedStory.value.content, class: "w-full h-full object-contain", autoplay: true, playsinline: true, loop: true }),
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
            disabled: isSubmittingPost.value || (postingTab.value === 'text' && !newPostContent.value.trim()) || (postingTab.value === 'audio' && !recordedAudio.value),
            class: "w-full bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 disabled:opacity-20 active:scale-95 transition-all flex items-center justify-center gap-2"
          }, isSubmittingPost.value ? [
            h('div', { class: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" }),
            "Publication..."
          ] : "Publier l'étincelle")
        ])
      ]) : null,

      h('button', {
        onClick: () => isPosting.value = true,
        class: "fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-95 transition-transform"
      }, [h('span', { class: "material-icons-round text-4xl" }, 'add')])
    ]);
  }
});
