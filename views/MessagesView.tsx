import { defineComponent, h, ref, onMounted } from 'vue';
import { api } from '../services/api';

export default defineComponent({
  name: 'MessagesView',
  emits: ['openChat', 'openDiscovery'],
  setup(props, { emit }) {
    const conversations = ref<any[]>([]);
    const isLoading = ref(true);

    onMounted(async () => {
      try {
        const data = await api.getConversationsAll();
        conversations.value = data.conversations || [];
      } catch (err) {
        console.error("Erreur chargement conversations:", err);
      } finally {
        isLoading.value = false;
      }
    });

    return () => h('div', { class: "flex flex-col min-h-full bg-background-light dark:bg-background-dark" }, [
      h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 ios-blur px-5 pt-10 pb-4 flex items-center justify-between" }, [
        h('h1', { class: "text-3xl font-extrabold tracking-tight" }, 'Messages'),
        h('div', { class: "flex gap-4" }, [
          h('span', { class: "material-icons-round text-2xl" }, 'video_call'),
          h('span', { class: "material-icons-round text-2xl" }, 'edit_note')
        ])
      ]),

      h('div', { class: "px-5 mt-4" }, [
        h('button', {
          onClick: () => emit('openDiscovery'),
          class: "w-full bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all"
        }, [
          h('div', { class: "flex items-center gap-3" }, [
            h('div', { class: "w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg" }, [
              h('span', { class: "material-icons-round" }, 'person_search')
            ]),
            h('div', { class: "text-left shadow-none" }, [
              h('p', { class: "font-black text-sm text-primary" }, "Trouver du monde"),
              h('p', { class: "text-[10px] opacity-60" }, "Découvre les autres étudiants")
            ])
          ]),
          h('span', { class: "material-icons-round text-primary/30" }, 'chevron_right')
        ])
      ]),

      h('div', { class: "px-5 divide-y divide-primary/5 mt-4 pb-20" },
        isLoading.value ? h('div', { class: "py-20 text-center opacity-40" }, [
          h('span', { class: "material-icons-round animate-spin text-4xl mb-4" }, 'refresh'),
          h('p', { class: "font-bold text-xs uppercase tracking-widest" }, "Chargement...")
        ]) : (
          conversations.value.length > 0 ? conversations.value.map(c => h('div', {
            key: c.id,
            onClick: () => emit('openChat', c.id),
            class: "flex items-center gap-4 py-4 active:bg-primary/5 transition-colors cursor-pointer"
          }, [
            h('div', { class: "relative shrink-0" }, [
              c.avatar ? h('img', {
                src: c.avatar,
                class: `w-14 h-14 rounded-full object-cover border-2 border-primary/10`,
              }) : h('div', {
                class: "w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary"
              }, [
                h('span', { class: "material-icons-round text-3xl" }, 'person_outline')
              ]),
              c.unread ? h('div', { class: "absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary border-2 border-white dark:border-background-dark rounded-full shadow-sm" }) : null
            ]),
            h('div', { class: "flex-1 min-w-0" }, [
              h('div', { class: "flex justify-between items-baseline mb-0.5" }, [
                h('h3', { class: "font-bold text-[15px] truncate" }, c.name),
                h('span', { class: `text-[11px] font-medium opacity-40` }, c.time)
              ]),
              h('div', { class: "flex items-center justify-between" }, [
                h('p', { class: `text-[13px] truncate ${c.unread ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500'}` }, c.message),
                c.unread ? h('div', { class: "w-2.5 h-2.5 bg-primary rounded-full ml-2" }) : null
              ])
            ])
          ])) : h('div', { class: "py-20 text-center opacity-30" }, [
            h('span', { class: "material-icons-round text-5xl mb-4" }, 'chat_bubble_outline'),
            h('p', { class: "font-black" }, "Aucune conversation")
          ])
        )
      )
    ]);
  }
});