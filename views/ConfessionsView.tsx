import { defineComponent, ref, h, onMounted } from 'vue';
import { api } from '../services/api';
import { Confession } from '../services/db';
import { toast } from '../services/toast';
import { formatRelativeDate } from '../services/dates';

export default defineComponent({
  name: 'ConfessionsView',
  setup() {
    const confessions = ref<Confession[]>([]);
    const isPosting = ref(false);
    const isSubmitting = ref(false);
    const isLoading = ref(true);
    const newConfession = ref('');
    const user = JSON.parse(localStorage.getItem('up_profile') || '{}');

    const loadConfessions = async () => {
      try {
        const data = await api.getConfessions();
        confessions.value = data.confessions || [];
      } catch (err) {
        console.error("Error loading confessions:", err);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(loadConfessions);

    const toggleFlame = async (c: Confession) => {
      try {
        const result = await api.flameConfession(c.id);
        c.flames = result.flames;
        // Optimization: toggle local state if we had one, 
        // but for now we rely on the returned count.
        // We'll also need a way to track if 'me' flamed it.
        await loadConfessions();
      } catch (err: any) {
        toast.error(err.message || "Erreur");
      }
    };

    const showComments = ref<Record<string, boolean>>({});
    const newComment = ref<Record<string, string>>({});

    const addComment = async (c: Confession) => {
      const text = newComment.value[c.id];
      if (!text || !text.trim()) return;

      const user = JSON.parse(localStorage.getItem('up_profile') || '{}');
      const comment = {
        id: Date.now().toString(),
        author: user.name || 'Anonyme',
        avatar: user.avatar || '/assets/default-avatar.svg',
        text: text.trim(),
        createdAt: new Date()
      };

      const updatedCommentsList = [comment, ...(c.commentsList || [])];

      try {
        await api.updateConfession(c.id, { commentsList: updatedCommentsList });
        c.commentsList = updatedCommentsList;
        newComment.value[c.id] = '';
      } catch (err) {
        toast.error("Erreur lors de l'ajout du commentaire");
      }
    };

    const submitConfession = async () => {
      if (!newConfession.value.trim() || isSubmitting.value) return;
      isSubmitting.value = true;
      try {
        await api.createConfession(newConfession.value.trim());
        newConfession.value = '';
        isPosting.value = false;
        await loadConfessions();
      } catch (err: any) {
        toast.error("Échec de la publication.");
      } finally {
        isSubmitting.value = false;
      }
    };

    const deleteConfession = async (id: string) => {
      import('../services/toast').then(m => {
        m.toast.info('🔧 Système de suppression en cours de développement', {
          duration: 4000,
          position: 'top-center'
        });
      });
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
          h('p', { class: "text-primary font-black text-[10px] uppercase tracking-widest mb-1" }, 'Anonyme'),
          h('p', { class: "text-[10px] opacity-30 font-bold mb-3" }, formatRelativeDate(c.createdAt || c.time)),
          h('div', { class: "flex items-center justify-between mb-4" }, [
            h('p', { class: "text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium flex-1" }, c.content),
            // Bouton supprimer pour l'auteur ou admin
            (c.authorId === user.phone || c.user === user.phone || user.phone === '0198874019') ? h('button', {
              onClick: () => deleteConfession(c.id),
              class: "text-red-500 ml-2 p-1"
            }, [
              h('span', { class: "material-icons-round" }, 'delete')
            ]) : null
          ]),
          h('div', { class: "flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-4" }, [
            h('div', { class: "flex items-center gap-4" }, [
              h('div', { class: "flex items-center gap-2" }, [
                h('span', { class: `material-icons-round text-lg ${c.isFlamedByMe ? 'text-primary' : 'opacity-30'}` }, 'local_fire_department'),
                h('span', { class: "text-xs font-black opacity-50" }, `${c.flames || 0} flammes`)
              ]),
              h('button', {
                onClick: () => {
                  if (!showComments.value[c.id]) showComments.value[c.id] = true;
                  else showComments.value[c.id] = false;
                },
                class: "flex items-center gap-2 text-slate-400 active:scale-110 transition-all focus:outline-none"
              }, [
                h('span', { class: "material-icons-round text-lg" }, 'chat_bubble_outline'),
                h('span', { class: "text-xs font-black" }, (c.commentsList || []).length)
              ])
            ]),
            h('button', {
              onClick: () => toggleFlame(c),
              class: `text-[10px] font-black uppercase px-4 py-2 rounded-full transition-all active:scale-95 ${c.isFlamedByMe ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary'}`
            }, c.isFlamedByMe ? '🔥 Flambant' : 'Enflammer')
          ]),

          showComments.value[c.id] ? h('div', { class: "mt-6 pt-4 border-t border-slate-50 dark:border-white/5 space-y-4" }, [
            h('div', { class: "flex gap-3 bg-slate-50 dark:bg-white/5 rounded-2xl p-2 px-4" }, [
              h('input', {
                value: newComment.value[c.id] || '',
                onInput: (e: any) => newComment.value[c.id] = e.target.value,
                onKeyup: (e: any) => e.key === 'Enter' && addComment(c),
                placeholder: "Ton commentaire...",
                class: "flex-1 bg-transparent border-none text-xs focus:ring-0 py-2 dark:text-white"
              }),
              h('button', { onClick: () => addComment(c), class: "text-primary font-black text-[10px] uppercase tracking-widest px-2" }, "OK")
            ]),
            h('div', { class: "space-y-4 max-h-60 overflow-y-auto no-scrollbar" },
              (c.commentsList || []).map((comment: any) => h('div', { class: "flex gap-3", key: comment.id }, [
                h('img', { src: comment.avatar || '/assets/default-avatar.svg', class: "w-8 h-8 rounded-full object-cover bg-slate-100" }),
                h('div', { class: "flex-1 bg-slate-50 dark:bg-white/5 rounded-2xl p-3" }, [
                  h('p', { class: "text-[10px] font-black uppercase tracking-widest text-primary mb-1" }, comment.author),
                  h('p', { class: "text-xs font-medium opacity-80" }, comment.text),
                  h('p', { class: "text-[8px] opacity-30 font-bold mt-2" }, formatRelativeDate(comment.createdAt || comment.time))
                ])
              ]))
            )
          ]) : null

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
