
import { defineComponent, ref, h, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { db } from '../services/db';

export default defineComponent({
  name: 'ChatDetailView',
  props: ['convId'],
  emits: ['back'],
  setup(props, { emit }) {
    const messages = ref<{ id: string, text: string, isMe: boolean, time: string }[]>([]);
    const newMessage = ref('');
    const scrollRef = ref(null);
    let unsubscribe: any = null;

    onMounted(() => {
      const currentUser = db.getProfile();
      const myPhone = currentUser.phone || '0197000000';

      unsubscribe = db.subscribeMessages(props.convId || 'default', (newMsgs) => {
        messages.value = newMsgs.map((m: any) => ({
          id: m.id,
          text: m.text,
          isMe: m.from === myPhone,
          time: m.time
        }));
        scrollToBottom();
      });
      scrollToBottom();
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    const scrollToBottom = async () => {
      await nextTick();
      if (scrollRef.value) {
        (scrollRef.value as any).scrollTop = (scrollRef.value as any).scrollHeight;
      }
    };

    const handleSend = async () => {
      if (!newMessage.value.trim()) return;

      const currentUser = db.getProfile();
      const myPhone = currentUser.phone || '0197000000';
      const text = newMessage.value;
      newMessage.value = '';

      await db.sendMessage(props.convId || 'default', { text, from: myPhone });
    };

    return () => h('div', { class: "fixed inset-0 z-[120] flex flex-col bg-white dark:bg-[#0f1115] animate-in slide-in-from-right overflow-hidden" }, [
      // Header
      h('header', { class: "flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-white/95 dark:bg-[#0f1115]/95 ios-blur shrink-0" }, [
        h('div', { class: "flex items-center gap-3" }, [
          h('button', { onClick: () => emit('back'), class: "text-primary p-2 active:scale-90" }, [
            h('span', { class: "material-icons-round text-3xl" }, 'chevron_left')
          ]),
          h('div', { class: "flex items-center gap-3" }, [
            h('img', { src: `assets/avatar-${(parseInt(props.convId || '1') % 2) + 1}.svg`, class: "w-10 h-10 rounded-full object-cover border-2 border-primary/20" }),
            h('div', [
              h('p', { class: "text-sm font-black" }, 'Interlocuteur UP'),
              h('p', { class: "text-[10px] text-emerald-500 font-black uppercase tracking-widest" }, 'En ligne')
            ])
          ])
        ])
      ]),

      // Chat Area
      h('div', {
        ref: scrollRef,
        class: "flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-50 dark:bg-transparent pb-10"
      }, [
        messages.value.map(m => h('div', { class: `flex ${m.isMe ? 'justify-end' : 'justify-start'}` }, [
          h('div', {
            class: `max-w-[80%] px-4 py-3 rounded-[24px] text-sm shadow-sm ${m.isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-white/5 dark:text-white rounded-tl-none border border-slate-100 dark:border-white/5'
              }`
          }, [
            h('p', { class: "font-medium" }, m.text),
            h('p', { class: "text-[8px] mt-1 font-bold opacity-40 text-right uppercase" }, m.time)
          ])
        ]))
      ]),

      // Input Footer
      h('footer', { class: "p-4 bg-white dark:bg-[#0f1115] border-t border-primary/5 pb-10 sm:pb-4" }, [
        h('div', { class: "flex items-center gap-3 bg-slate-100 dark:bg-white/5 rounded-full px-4 py-2" }, [
          h('input', {
            value: newMessage.value,
            onInput: (e: any) => newMessage.value = e.target.value,
            onKeyup: (e: any) => e.key === 'Enter' && handleSend(),
            placeholder: "Écris ton message...",
            class: "flex-1 bg-transparent border-none text-sm focus:ring-0 py-3 dark:text-white"
          }),
          h('button', {
            onClick: handleSend,
            disabled: !newMessage.value.trim(),
            class: "w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-20 transition-all"
          }, [
            h('span', { class: "material-icons-round" }, 'send')
          ])
        ])
      ])
    ]);
  }
});
