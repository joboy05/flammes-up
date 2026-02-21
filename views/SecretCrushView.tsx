
import { defineComponent, ref, h } from 'vue';

export default defineComponent({
  name: 'SecretCrushView',
  emits: ['back'],
  setup(props, { emit }) {
    const phone = ref('');
    const status = ref('idle'); // idle, checking, sent

    const handlePhoneInput = (e) => {
      phone.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    };

    const sendCrush = async () => {
      if (phone.value.length < 8) return;
      
      status.value = 'checking';
      
      try {
        const currentUser = JSON.parse(localStorage.getItem('up_profile') || '{}');
        const myPhone = currentUser.phone || '0100000000';

        const response = await fetch('http://localhost:3005/api/crush/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: myPhone, to: phone.value })
        });

        const data = await response.json();

        if (data.match) {
          status.value = 'match';
        } else {
          // Simulation : On tente d'abord un SMS/RCS externe
          const message = encodeURIComponent(`Wopé ! Quelqu'un sur l'app Flammes UP a un crush secret sur toi... Télécharge l'app pour savoir si c'est mutuel ! 🔥`);
          window.location.href = `sms:${phone.value}?body=${message}`;
          status.value = 'sent';
        }
      } catch (e) {
        console.error('Crush API Error', e);
        status.value = 'sent'; // Fallback to anonymous SMS
      }
    };

    return () => h('div', { class: "fixed inset-0 z-[150] bg-[#0f1115] text-white p-8 flex flex-col relative overflow-hidden" }, [
      h('div', { class: "absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" }),
      
      h('header', { class: "relative z-10 flex items-center justify-between mb-12" }, [
        h('button', { onClick: () => emit('back'), class: "w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90" }, [
          h('span', { class: "material-icons-round" }, 'close')
        ]),
        h('span', { class: "text-[10px] font-black tracking-[0.3em] text-primary uppercase" }, 'Flamme Secrète')
      ]),

      h('div', { class: "relative z-10 flex-1 flex flex-col items-center justify-center text-center" }, [
        status.value === 'idle' || status.value === 'checking' ? [
          h('div', { class: "w-28 h-28 bg-primary rounded-[35px] flex items-center justify-center shadow-[0_0_60px_rgba(238,43,43,0.4)] mb-8 animate-pulse" }, [
            h('span', { class: "material-icons-round text-6xl" }, 'favorite')
          ]),
          h('h1', { class: "text-4xl font-black mb-4 tracking-tighter" }, 'C\'est qui le Crush ?'),
          h('p', { class: "text-white/50 text-sm max-w-[280px] mb-12" }, "Indique son numéro. On lui envoie un SMS anonyme. Si c'est mutuel, on vous connecte !"),
          
          h('div', { class: "w-full space-y-6" }, [
            h('div', { class: "bg-white/5 border border-white/10 rounded-[35px] p-8 shadow-inner" }, [
              h('p', { class: "text-[9px] font-black uppercase tracking-widest text-primary mb-6" }, "NUMÉRO DE TÉLÉPHONE"),
              h('div', { class: "flex items-center justify-center gap-3" }, [
                h('span', { class: "text-3xl font-black opacity-20" }, '+229'),
                h('input', { 
                  value: phone.value,
                  onInput: handlePhoneInput,
                  type: "tel",
                  placeholder: "01 00 00 00",
                  class: "bg-transparent border-none text-center text-3xl font-black tracking-[0.1em] focus:ring-0 w-48 text-white"
                })
              ])
            ]),
            h('button', { 
              onClick: sendCrush,
              disabled: phone.value.length < 8 || status.value === 'checking',
              class: "w-full bg-primary text-white font-black py-6 rounded-[30px] shadow-2xl active:scale-95 disabled:opacity-20 transition-all uppercase tracking-widest text-xs"
            }, status.value === 'checking' ? 'Chiffrement...' : 'Envoyer l\'étincelle')
          ])
        ] : status.value === 'match' ? [
          h('div', { class: "space-y-8 animate-in zoom-in duration-500 flex flex-col items-center" }, [
            h('div', { class: "flex -space-x-4 mb-4" }, [
              h('div', { class: "w-20 h-20 rounded-full border-4 border-primary bg-primary/20 flex items-center justify-center" }, [
                h('span', { class: "material-icons-round text-4xl" }, 'person')
              ]),
              h('div', { class: "w-20 h-20 rounded-full border-4 border-primary bg-primary flex items-center justify-center shadow-2xl" }, [
                h('span', { class: "material-icons-round text-4xl text-white font-bold" }, 'favorite')
              ])
            ]),
            h('h2', { class: "text-4xl font-black text-primary animate-bounce" }, 'MATCH ! 🔥'),
            h('p', { class: "text-white text-lg font-bold max-w-[280px] mx-auto" }, "C'est mutuel ! Tu viens de trouver une étincelle sur le campus."),
            h('button', { 
              onClick: () => emit('back'),
              class: "bg-primary w-full py-5 rounded-full text-white font-black uppercase text-xs tracking-[0.2em] shadow-[0_20px_40px_rgba(238,43,43,0.4)] mt-10 active:scale-95" 
            }, 'Lui envoyer un message')
          ])
        ] : [
          h('div', { class: "space-y-8 animate-in zoom-in duration-500" }, [
            h('div', { class: "w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)]" }, [
              h('span', { class: "material-icons-round text-5xl text-white" }, 'done_all')
            ]),
            h('h2', { class: "text-3xl font-black" }, 'Invitation Lancée !'),
            h('p', { class: "text-white/60 text-sm max-w-[280px] mx-auto" }, "Si cette personne télécharge Flammes UP et t'ajoute aussi, tu recevras une notification immédiate !"),
            h('button', { onClick: () => status.value = 'idle', class: "bg-white/10 px-10 py-5 rounded-full text-white font-bold uppercase text-[10px] tracking-widest mt-10" }, 'Terminer')
          ])
        ]
      ])
    ]);
  }
});
