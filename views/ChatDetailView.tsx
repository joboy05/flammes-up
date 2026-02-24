
import { defineComponent, ref, h, onMounted, onUnmounted, nextTick, watch, Transition } from 'vue';
import { db } from '../services/db';
import { api } from '../services/api';
import { ws } from '../services/socket';
import AudioRecorder from '../components/AudioRecorder';

import { ChatMessage } from '../types';

export default defineComponent({
  name: 'ChatDetailView',
  props: ['convId'],
  emits: ['back'],
  setup(props, { emit }) {
    const messages = ref<ChatMessage[]>([]);
    const newMessage = ref('');
    const scrollRef = ref(null);
    let unsubscribe: any = null;

    const isMenuOpen = ref(false);
    const isRecording = ref(false);
    const myPhone = ref('');
    const otherUserName = ref('Interlocuteur UP');
    const otherUserAvatar = ref('');

    onMounted(async () => {
      const currentUser = db.getProfile();
      myPhone.value = currentUser.phone || '0197000000';

      const activeId = props.convId || (window as any)._activeConvId || 'default';
      const participants = activeId.split('-');
      const otherPhone = participants.find((p: string) => p !== myPhone.value);

      if (otherPhone) {
        // Try to find in global user list or fetch (simplified: fetch all and find)
        try {
          const usersRes = await api.getUsers();
          const otherUser = usersRes.users?.find((u: any) => u.phone === otherPhone);
          if (otherUser) {
            otherUserName.value = otherUser.name || 'Utilisateur UP';
            otherUserAvatar.value = otherUser.avatar || '';
          }
        } catch (e) { console.error(e); }
      }

      // Sync initial messages from API
      try {
        const data = await api.getMessages(activeId);
        if (data.messages) {
          messages.value = data.messages;
          scrollToBottom();
        }
      } catch (err) {
        console.warn("Failed to fetch initial messages from API:", err);
      }

      // Keep Firestore subscription as secondary/real-time source
      unsubscribe = db.subscribeMessages(activeId, (newMsgs: ChatMessage[]) => {
        messages.value = newMsgs;
        scrollToBottom();
      });

      // WebSocket support
      ws.joinConversation(activeId);
      ws.on('new-message', ({ convId, message }: any) => {
        if (convId === activeId) {
          // Add message if not already present (optimization to avoid double display with Firestore)
          if (!messages.value.find(m => m.id === message.id)) {
            messages.value.push(message);
            scrollToBottom();
          }
        }
      });

      scrollToBottom();
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
      const activeId = props.convId || (window as any)._activeConvId || 'default';
      ws.leaveConversation(activeId);
    });

    const scrollToBottom = async () => {
      await nextTick();
      if (scrollRef.value) {
        (scrollRef.value as any).scrollTop = (scrollRef.value as any).scrollHeight;
      }
    };

    const handleSend = async () => {
      if (!newMessage.value.trim()) return;
      const text = newMessage.value;
      newMessage.value = '';

      const activeId = props.convId || (window as any)._activeConvId || 'default';

      // Use API instead of direct Firestore
      await api.sendMessage(activeId, {
        text,
        from: myPhone.value,
        type: 'text'
      });
    };

    const handleVoiceRecorded = async (audio: any) => {
      const activeId = props.convId || (window as any)._activeConvId || 'default';
      await api.sendMessage(activeId, {
        from: myPhone.value,
        type: 'audio',
        mediaUrl: audio.data,
        audioDuration: audio.duration
      });
      isRecording.value = false;
    };

    const handleFileUpload = async (type: 'image' | 'video', e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      const activeId = props.convId || (window as any)._activeConvId || 'default';
      reader.onloadend = async () => {
        await api.sendMessage(activeId, {
          from: myPhone.value,
          type: type,
          mediaUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
      isMenuOpen.value = false;
    };

    const handleShareLocation = () => {
      if (!navigator.geolocation) return alert("Géolocalisation non supportée.");
      const activeId = props.convId || (window as any)._activeConvId || 'default';
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await api.sendMessage(activeId, {
          from: myPhone.value,
          type: 'location',
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        });
      });
      isMenuOpen.value = false;
    };

    return () => h('div', { class: "fixed inset-0 z-[120] flex flex-col bg-white dark:bg-[#0f1115] animate-in slide-in-from-right overflow-hidden" }, [
      // Header
      h('header', { class: "flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-white/95 dark:bg-[#0f1115]/95 ios-blur shrink-0" }, [
        h('div', { class: "flex items-center gap-3" }, [
          h('button', { onClick: () => emit('back'), class: "text-primary p-2 active:scale-90" }, [
            h('span', { class: "material-icons-round text-3xl" }, 'chevron_left')
          ]),
          h('div', { class: "flex items-center gap-3" }, [
            h('img', {
              src: otherUserAvatar.value || `assets/avatar-${(parseInt(props.convId || '1') % 2) + 1}.svg`,
              class: "w-10 h-10 rounded-full object-cover border-2 border-primary/20 bg-slate-100"
            }),
            h('div', [
              h('p', { class: "text-sm font-black" }, otherUserName.value),
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
        messages.value.map(m => {
          const isMe = m.from === myPhone.value;
          return h('div', { class: `flex ${isMe ? 'justify-end' : 'justify-start'}` }, [
            h('div', {
              class: `max-w-[85%] px-4 py-3 rounded-[24px] text-sm shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-white/5 dark:text-white rounded-tl-none border border-slate-100 dark:border-white/5'}`
            }, [
              // Text Content
              m.text ? h('p', { class: "font-medium mb-1 whitespace-pre-wrap" }, m.text) : null,

              // Image Content
              m.type === 'image' && m.mediaUrl ? h('img', {
                src: m.mediaUrl,
                class: "rounded-2xl max-w-full mb-1 border border-white/10",
                onClick: () => window.open(m.mediaUrl, '_blank')
              }) : null,

              // Video Content (simplified)
              m.type === 'video' && m.mediaUrl ? h('video', {
                src: m.mediaUrl,
                controls: true,
                class: "rounded-2xl max-w-full mb-1"
              }) : null,

              // Audio Content
              m.type === 'audio' && m.mediaUrl ? h('div', { class: "flex items-center gap-2 py-2" }, [
                h('span', { class: "material-icons-round" }, 'play_circle'),
                h('div', { class: "h-1 flex-1 bg-white/20 rounded-full overflow-hidden" }, [
                  h('div', { class: "h-full bg-white w-1/3" })
                ]),
                h('span', { class: "text-[10px] font-bold" }, m.audioDuration || '0:00')
              ]) : null,

              // Location Content
              m.type === 'location' && m.location ? h('button', {
                onClick: () => window.open(`https://www.google.com/maps?q=${m.location?.lat},${m.location?.lng}`, '_blank'),
                class: "flex items-center gap-3 bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all text-left w-full"
              }, [
                h('span', { class: "material-icons-round text-primary" }, 'location_on'),
                h('div', [
                  h('p', { class: "text-[10px] font-black uppercase tracking-widest text-primary" }, "Position"),
                  h('p', { class: "text-[8px] opacity-60" }, "Clique pour voir sur la carte")
                ])
              ]) : null,

              h('p', { class: "text-[8px] mt-1 font-bold opacity-40 text-right uppercase" }, m.time)
            ])
          ]);
        })
      ]),

      // Multi-media Menu
      h(Transition, {
        enterActiveClass: "transition duration-300 ease-out",
        enterFromClass: "transform translate-y-10 opacity-0",
        enterToClass: "transform translate-y-0 opacity-100",
        leaveActiveClass: "transition duration-200 ease-in",
        leaveFromClass: "transform translate-y-0 opacity-100",
        leaveToClass: "transform translate-y-10 opacity-0"
      }, {
        default: () => isMenuOpen.value ? h('div', {
          class: "fixed bottom-28 left-4 right-4 z-[130] bg-white dark:bg-[#1c1f26] rounded-[32px] p-6 shadow-2xl border border-primary/10 flex grid grid-cols-3 gap-4"
        }, [
          [
            { id: 'image', icon: 'image', label: 'Photos', color: 'bg-blue-500' },
            { id: 'video', icon: 'videocam', label: 'Vidéos', color: 'bg-rose-500' },
            { id: 'location', icon: 'location_on', label: 'Position', color: 'bg-emerald-500' }
          ].map(opt => h('button', {
            onClick: opt.id === 'location' ? handleShareLocation : () => (document.getElementById(`input-${opt.id}`) as any).click(),
            class: "flex flex-col items-center gap-2 group"
          }, [
            h('div', { class: `w-14 h-14 ${opt.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-90 transition-all` }, [
              h('span', { class: "material-icons-round text-2xl" }, opt.icon)
            ]),
            h('span', { class: "text-[10px] font-bold opacity-60 uppercase tracking-widest" }, opt.label)
          ]))
        ]) : null
      }),

      // Recording Modal Overlay
      isRecording.value ? h('div', { class: "fixed inset-0 z-[140] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6" }, [
        h('div', { class: "w-full max-w-sm" }, [
          h(AudioRecorder, {
            onRecorded: handleVoiceRecorded,
            onClose: () => isRecording.value = false
          }),
          h('button', {
            onClick: () => isRecording.value = false,
            class: "mt-6 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/40"
          }, "Annuler")
        ])
      ]) : null,

      // Hidden Inputs
      h('input', { id: 'input-image', type: 'file', accept: 'image/*', class: "hidden", onChange: (e: any) => handleFileUpload('image', e) }),
      h('input', { id: 'input-video', type: 'file', accept: 'video/*', class: "hidden", onChange: (e: any) => handleFileUpload('video', e) }),

      // Input Footer
      h('footer', { class: "p-4 bg-white dark:bg-[#0f1115] border-t border-primary/5 pb-10 sm:pb-4 shrink-0" }, [
        h('div', { class: "flex items-center gap-3" }, [
          // Multimedia Toggle
          h('button', {
            onClick: () => isMenuOpen.value = !isMenuOpen.value,
            class: `w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMenuOpen.value ? 'bg-primary text-white rotate-45' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`
          }, [
            h('span', { class: "material-icons-round" }, 'add')
          ]),

          h('div', { class: "flex-1 flex items-center gap-3 bg-slate-100 dark:bg-white/5 rounded-[24px] px-4 py-1" }, [
            h('input', {
              value: newMessage.value,
              onInput: (e: any) => newMessage.value = e.target.value,
              onKeyup: (e: any) => e.key === 'Enter' && handleSend(),
              placeholder: "Écris ton message...",
              class: "flex-1 bg-transparent border-none text-sm focus:ring-0 py-3 dark:text-white"
            }),

            newMessage.value.trim() ? h('button', {
              onClick: handleSend,
              class: "w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
            }, [
              h('span', { class: "material-icons-round" }, 'send')
            ]) : h('button', {
              onClick: () => isRecording.value = true,
              class: "w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center active:scale-95 transition-all"
            }, [
              h('span', { class: "material-icons-round" }, 'mic')
            ])
          ])
        ])
      ])
    ]);
  }
});
