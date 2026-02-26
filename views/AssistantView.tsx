import { defineComponent, ref, h, nextTick, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'ChatUPView',
  emits: ['back'],
  setup(props, { emit }) {
    const STORAGE_KEY = 'chatup_history';
    const userProfile = JSON.parse(localStorage.getItem('up_profile') || '{}');
    const userId = userProfile.uid || 'anonymous_' + Math.random().toString(36).substr(2, 9);

    const messages = ref<{ role: string, text: string, parts?: any, image?: string | null }[]>([
      { role: 'model', text: "Connexion au cerveau de ChatUP..." }
    ]);
    const userInput = ref('');
    const isLoading = ref(false);
    const scrollRef = ref(null);
    const selectedModel = ref<'gemini' | 'groq'>('groq');
    const selectedImage = ref<string | null>(null);

    const scrollToBottom = async () => {
      await nextTick();
      if (scrollRef.value) {
        (scrollRef.value as HTMLElement).scrollTop = (scrollRef.value as HTMLElement).scrollHeight;
      }
    };

    onMounted(async () => {
      await scrollToBottom();
      try {
        const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/ai/history/' + userId;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.history) {
            messages.value = data.history.map(m => ({
              role: m.role === 'model' ? 'model' : 'user',
              text: m.parts && m.parts[0] ? m.parts[0].text : m.text || ''
            }));
          }
        }
      } catch (e) {
        messages.value = [{ role: 'model', text: "Wopé... j'ai un peu de mal à me réveiller là." }];
      }
      messages.value = messages.value.filter(m => m.text); // Filter empty
      if (messages.value.length === 0) {
        messages.value = [{ role: 'model', text: "Wopé le boss ! Je suis ChatUP. On est ensemble !" }];
      }
      await scrollToBottom();
    });

    const handleImageUpload = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const { compressImage } = await import('../services/imageUtils');
          selectedImage.value = await compressImage(file, 800, 800, 0.7);
        } catch (err) {
          const reader = new FileReader();
          reader.onload = (re) => {
            selectedImage.value = re.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
      }
    };

    const sendMessage = async () => {
      const text = userInput.value;
      const img = selectedImage.value;
      if ((!text.trim() && !img) || isLoading.value) return;

      messages.value.push({ role: 'user', text, image: img });
      userInput.value = '';
      selectedImage.value = null;
      isLoading.value = true;
      await scrollToBottom();

      try {
        const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/ai/chat';
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, userId })
        });

        if (!response.ok) throw new Error("Erreur Serveur API AI");

        const aiMessage = ref({ role: 'model', text: '' });
        messages.value.push(aiMessage.value);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.includes('[DONE]')) continue;
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  aiMessage.value.text += data.text;
                  await scrollToBottom();
                }
              } catch (e) { }
            }
          }
        }
      } catch (e: any) {
        console.error("AI Error:", e);
        messages.value.push({ role: 'model', text: "Aïe, mon cerveau chauffe un peu ! " + (e.message || "Réessaie plus tard, le boss.") });
      } finally {
        isLoading.value = false;
        await scrollToBottom();
      }
    };

    return () => h('div', {
      class: "fixed inset-0 z-[100] flex flex-col bg-white dark:bg-[#0f1115] animate-in slide-in-from-right h-screen overflow-hidden"
    }, [
      // Header
      h('header', { class: "flex items-center gap-4 px-5 py-4 border-b border-primary/10 bg-white/95 dark:bg-[#0f1115]/95 ios-blur shrink-0" }, [
        h('button', {
          onClick: () => {
            // Clear history if user really wants to start fresh (optionnel)
            emit('back');
          }, class: "w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-90"
        }, [
          h('span', { class: "material-icons-round" }, 'arrow_back')
        ]),
        h('div', [
          h('h1', { class: "text-lg font-black text-primary leading-tight" }, 'ChatUP AI'),
          h('div', { class: "flex items-center gap-2 mt-0.5" }, [
            h('span', { class: "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20" }, 'Gemini + Tools')
          ])
        ]),
        h('button', {
          onClick: async () => {
            if (confirm("Effacer la mémoire de ChatUP ?")) {
              messages.value = [{ role: 'model', text: "Wopé ! Mémoire effacée. Quoi de neuf le boss ?" }];
              try {
                const url = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/ai/chat';
                await fetch(url, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: '', userId, reset: true })
                });
              } catch (e) { }
            }
          },
          class: "ml-auto text-slate-400 hover:text-primary transition-colors"
        }, [
          h('span', { class: "material-icons-round text-xl" }, 'delete_sweep')
        ])
      ]),

      // Chat Messages
      h('div', {
        ref: scrollRef,
        class: "flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar pb-10"
      }, [
        messages.value.map(m => h('div', { class: `flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}` }, [
          m.image ? h('img', { src: m.image, class: "max-w-[70%] rounded-2xl object-cover shadow-sm mb-1" }) : null,
          m.text ? h('div', {
            class: `max-w-[85%] px-5 py-4 rounded-[26px] text-sm shadow-sm ${m.role === 'user'
              ? 'bg-primary text-white rounded-tr-none'
              : 'bg-slate-100 dark:bg-white/5 rounded-tl-none text-slate-800 dark:text-slate-200'
              }`
          }, m.text) : null
        ])),
        isLoading.value ? h('div', { class: "flex justify-start" }, [
          h('div', { class: "bg-slate-100 dark:bg-white/5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase opacity-40 animate-pulse" }, "Réflexion en cours...")
        ]) : null
      ]),

      // Input Area
      h('footer', { class: "p-4 bg-white dark:bg-[#0f1115] border-t border-primary/5 pb-10 sm:pb-6" }, [
        selectedImage.value ? h('div', { class: "mb-3 relative inline-block" }, [
          h('img', { src: selectedImage.value, class: "h-20 w-20 object-cover rounded-xl border-2 border-primary/20" }),
          h('button', {
            onClick: () => selectedImage.value = null,
            class: "absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg"
          }, [h('span', { class: "material-icons-round text-xs" }, "close")])
        ]) : null,
        h('div', { class: "flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-full px-4 py-1.5 border border-slate-200 dark:border-white/10" }, [
          h('button', {
            onClick: () => (document.getElementById('chatup-image-upload') as HTMLInputElement)?.click(),
            class: "w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-primary transition-colors focus:outline-none"
          }, [
            h('span', { class: "material-icons-round" }, 'image')
          ]),
          h('input', {
            id: 'chatup-image-upload',
            type: 'file',
            accept: "image/*",
            class: "hidden",
            onChange: handleImageUpload
          }),
          h('input', {
            value: userInput.value,
            onInput: (e: any) => userInput.value = e.target.value,
            onKeyup: (e: any) => e.key === 'Enter' && sendMessage(),
            placeholder: "Message ou lien...",
            class: "flex-1 bg-transparent border-none text-sm focus:ring-0 py-4 dark:text-white outline-none"
          }),
          h('button', {
            onClick: sendMessage,
            disabled: (!userInput.value.trim() && !selectedImage.value) || isLoading.value,
            class: "w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 disabled:opacity-20 transition-all focus:outline-none"
          }, [
            h('span', { class: "material-icons-round text-2xl" }, 'send')
          ])
        ])
      ])
    ]);
  }
});