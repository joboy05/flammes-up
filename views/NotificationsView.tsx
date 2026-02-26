
import { defineComponent, ref, h, onMounted } from 'vue';
import { formatRelativeDate } from '../services/dates';

export default defineComponent({
  name: 'NotificationsView',
  emits: ['back', 'navigate'],
  setup(props, { emit }) {
    const filter = ref('all');
    const notifications = ref<any[]>([]);
    const isLoading = ref(true);
    const currentUserId = JSON.parse(localStorage.getItem('up_profile') || '{}').uid;

    const fetchNotifications = async () => {
      if (!currentUserId) return;
      try {
        const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/notifications/' + currentUserId;
        const res = await fetch(url);
        if (res.ok) {
            notifications.value = await res.json();
        }
      } catch (e) {
        console.error("Erreur chargement notifications:", e);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(fetchNotifications);

    const markAllRead = async () => {
      notifications.value = notifications.value.map(n => ({ ...n, unread: false }));
      if (currentUserId) {
        try {
          const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/notifications/' + currentUserId + '/read-all';
          await fetch(url, { method: 'PATCH' });
        } catch(e) {}
      }
    };

    return () => h('div', { class: "flex flex-col min-h-full bg-background-light dark:bg-background-dark" }, [
      h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 ios-blur px-5 pt-12 pb-4 border-b border-primary/10" }, [
        h('div', { class: "flex items-center justify-between mb-6" }, [
          h('div', { class: "flex items-center gap-4" }, [
            h('button', { onClick: () => emit('back'), class: "w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center" }, [
              h('span', { class: "material-icons-round" }, 'arrow_back')
            ]),
            h('h1', { class: "text-2xl font-bold tracking-tight" }, 'Activité')
          ]),
          h('button', { onClick: markAllRead, class: "text-[10px] font-bold text-primary uppercase tracking-widest" }, 'Tout lire')
        ]),

        h('div', { class: "flex gap-2 overflow-x-auto no-scrollbar" }, [
          { id: 'all', label: 'Tout' },
          { id: 'like', label: 'Flammes' },
          { id: 'reply', label: 'Réponses' },
          { id: 'system', label: 'Campus' }
        ].map(cat => h('button', {
          key: cat.id,
          onClick: () => filter.value = cat.id,
          class: `px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter.value === cat.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-primary/5 text-primary'}`
        }, cat.label)))
      ]),

      h('div', { class: "divide-y divide-primary/5" },
        notifications.value
          .filter(n => filter.value === 'all' || n.type === filter.value)
          .map(i => h('div', {
            key: i.id,
            onClick: async () => {
              if (i.unread) {
                i.unread = false;
                if (currentUserId && i.id) {
                   try {
                     const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/notifications/' + currentUserId + '/read/' + i.id;
                     await fetch(url, { method: 'PATCH' });
                   } catch(e) {}
                }
              }
              let target = 'feed';
              if (i.type === 'message') target = 'messages';
              else if (i.type === 'reply') target = 'confessions';
              else if (i.type === 'like') target = 'feed';
              emit('navigate', target);
            },
            class: `flex items-start gap-4 p-5 transition-colors cursor-pointer ${i.unread ? 'bg-primary/[0.03]' : 'active:bg-slate-50 dark:active:bg-primary/5'}`
          }, [
            h('div', { class: "shrink-0 mt-1" }, [
              i.type === 'like' ? h('span', { class: "material-icons-round text-primary" }, 'local_fire_department') :
                i.type === 'reply' ? h('span', { class: "material-icons-round text-blue-500" }, 'reply') :
                  i.type === 'message' ? h('span', { class: "material-icons-round text-green-500" }, 'chat_bubble') :
                    h('span', { class: "material-icons-round text-slate-400" }, 'info')
            ]),
            h('div', { class: "flex-1" }, [
              h('p', { class: `text-sm leading-snug ${i.unread ? 'font-bold' : 'text-slate-600 dark:text-slate-400'}` }, [
                h('span', { class: "text-slate-900 dark:text-white" }, i.actorName || i.user || 'Anonyme'), ' ', i.message || i.text
              ]),
              h('p', { class: "text-[10px] opacity-40 font-bold uppercase mt-1.5 tracking-wider" }, i.createdAt ? formatRelativeDate(i.createdAt) : (i.time || ''))
            ]),
            i.unread ? h('div', { class: "w-2 h-2 rounded-full bg-primary mt-2 shadow-sm" }) : null
          ]))
      ),

      notifications.value.length === 0 ? h('div', { class: "flex flex-col items-center justify-center py-20 opacity-30" }, [
        h('span', { class: "material-icons-round text-6xl mb-4" }, 'notifications_none'),
        h('p', { class: "font-bold text-sm uppercase tracking-widest" }, 'Aucune activité')
      ]) : null
    ]);
  }
});
