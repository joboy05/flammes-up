import { defineComponent, ref, h, nextTick, onMounted, onUnmounted } from 'vue';
import { GoogleGenAI } from "@google/genai";

export default defineComponent({
  name: 'ChatUPView',
  emits: ['back'],
  setup(props, { emit }) {
    const STORAGE_KEY = 'chatup_history';
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    const initialMessages = savedMessages ? JSON.parse(savedMessages) : [
      { role: 'model', text: "Wopé le boss ! Je suis ChatUP, ton majordome digital à Parakou. Tu veux savoir comment marche l'appli ou t'as besoin d'un conseil ?" }
    ];

    const messages = ref(initialMessages);
    const userInput = ref('');
    const isLoading = ref(false);
    const scrollRef = ref(null);
    const selectedModel = ref<'gemini' | 'groq'>('groq');

    const scrollToBottom = async () => {
      await nextTick();
      if (scrollRef.value) {
        scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
      }
    };

    onMounted(scrollToBottom);

    const sendMessage = async () => {
      const text = userInput.value;
      if (!text.trim() || isLoading.value) return;

      messages.value.push({ role: 'user', text });
      userInput.value = '';
      isLoading.value = true;
      await scrollToBottom();

      try {
        const SYSTEM_PROMPT = `Tu es ChatUP, l'assistant IA intelligent et attentionné de l'app "Flammes UP" à l'Université de Parakou.
CONTEXTE ET RÔLE :
- Tu es un étudiant en Master à l'UP, servant de mentor et de majordome digital.
- TON OBJECTIF : Être ultra-attentionné. Retiens les détails que l'utilisateur te donne pour personnaliser tes réponses futures.
- STYLE : Mélange d'intelligence artificielle sophistiquée et de culture locale de Parakou.
- LANGAGE : Français dynamique avec des touches de "Parakou style" (Wopé, Anhan, Gbelé, On est ensemble).
- COMPORTEMENT : Si l'utilisateur exprime une émotion (fatigue, joie, stress des examens), sois empathique et encourageant. Ne délire pas, reste dans le domaine du possible.
- CONNAISSANCES : Campus UP (resto U, bus bleus, facultés FLASH/FDSP/FASEG), vie à Parakou (Zongo, Banikanni), et fonctionnalités de l'app (FaceMatch, Marché).`;

        if (selectedModel.value === 'gemini') {
          const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
          if (!apiKey) throw new Error("API Key missing");
          const ai = new GoogleGenAI(apiKey);
          const lastUserMessage = messages.value[messages.value.length - 1].text;
          const contents = [
            { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
            { role: 'model', parts: [{ text: "Wopé le boss ! Je suis ChatUP. On est ensemble !" }] },
            ...messages.value.slice(0, -1).map(m => ({ role: m.role, parts: [{ text: m.text }] })),
            { role: 'user', parts: [{ text: lastUserMessage }] }
          ];

          const streamingResult = await ai.models.generateContentStream({
            model: 'gemini-1.5-flash',
            contents
          });

          const aiMessage = ref({ role: 'model', text: '' });
          messages.value.push(aiMessage.value);

          for await (const chunk of streamingResult) {
            const t = chunk.text;
            if (t) {
              aiMessage.value.text += t;
              await scrollToBottom();
            }
          }
        } else {
          const groqKey = import.meta.env.VITE_GROQ_API_KEY;
          if (!groqKey) throw new Error("Groq API Key missing");

          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages.value.slice(0, -1).map(m => ({
                  role: m.role === 'model' ? 'assistant' : 'user',
                  content: m.text
                }))
              ],
              stream: true
            })
          });

          if (!response.ok) throw new Error("Groq API Error");

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
                  const content = data.choices[0]?.delta?.content;
                  if (content) {
                    aiMessage.value.text += content;
                    await scrollToBottom();
                  }
                } catch (e) { }
              }
            }
          }
        }
        // Sauvegarder l'historique
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value.slice(-20))); // Garder les 20 derniers
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
            h('button', {
              onClick: () => selectedModel.value = 'groq',
              class: `text-[8px] font-black uppercase px-2 py-0.5 rounded-full border transition-all ${selectedModel.value === 'groq' ? 'bg-primary text-white border-primary' : 'border-primary/20 text-primary/40'}`
            }, 'Groq Cloud (Default)'),
            h('button', {
              onClick: () => selectedModel.value = 'gemini',
              class: `text-[8px] font-black uppercase px-2 py-0.5 rounded-full border transition-all ${selectedModel.value === 'gemini' ? 'bg-primary text-white border-primary' : 'border-primary/20 text-primary/40'}`
            }, 'Gemini Flash')
          ])
        ]),
        h('button', {
          onClick: () => {
            if (confirm("Effacer la mémoire de ChatUP ?")) {
              messages.value = [{ role: 'model', text: "Wopé ! Mémoire effacée. Quoi de neuf le boss ?" }];
              localStorage.removeItem(STORAGE_KEY);
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
        messages.value.map(m => h('div', { class: `flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}` }, [
          h('div', {
            class: `max-w-[85%] px-5 py-4 rounded-[26px] text-sm shadow-sm ${m.role === 'user'
              ? 'bg-primary text-white rounded-tr-none'
              : 'bg-slate-100 dark:bg-white/5 rounded-tl-none text-slate-800 dark:text-slate-200'
              }`
          }, m.text)
        ])),
        isLoading.value ? h('div', { class: "flex justify-start" }, [
          h('div', { class: "bg-slate-100 dark:bg-white/5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase opacity-40 animate-pulse" }, "Réflexion en cours...")
        ]) : null
      ]),

      // Input Area
      h('footer', { class: "p-4 bg-white dark:bg-[#0f1115] border-t border-primary/5 pb-10 sm:pb-6" }, [
        h('div', { class: "flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-full px-4 py-1.5 border border-slate-200 dark:border-white/10" }, [
          h('input', {
            value: userInput.value,
            onInput: (e: any) => userInput.value = e.target.value,
            onKeyup: (e: any) => e.key === 'Enter' && sendMessage(),
            placeholder: "Demande-moi n'importe quoi...",
            class: "flex-1 bg-transparent border-none text-sm focus:ring-0 py-4 dark:text-white"
          }),
          h('button', {
            onClick: sendMessage,
            disabled: !userInput.value.trim() || isLoading.value,
            class: "w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 disabled:opacity-20 transition-all"
          }, [
            h('span', { class: "material-icons-round text-2xl" }, 'send')
          ])
        ])
      ])
    ]);
  }
});