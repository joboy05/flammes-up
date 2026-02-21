
import { defineComponent, ref, h } from 'vue';

export default defineComponent({
  name: 'AuthView',
  emits: ['login', 'back'],
  setup(props, { emit }) {
    const phoneNumber = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const isLoginMode = ref(true);

    const handlePhoneInput = (e: any) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
      phoneNumber.value = val;
    };

    return () => h('div', { 
      class: "min-h-screen flex flex-col p-8 relative animate-in fade-in duration-500 bg-white dark:bg-[#0f1115]" 
    }, [
      h('header', { class: "relative z-10 mb-8" }, [
        h('button', { onClick: () => emit('back'), class: "text-slate-400 dark:text-white/60 hover:text-primary transition-colors" }, [
          h('span', { class: "material-icons-round text-3xl" }, 'arrow_back')
        ])
      ]),

      h('div', { class: "flex justify-center mb-8" }, [
        h('div', { class: "w-20 h-20 bg-primary rounded-[30px] flex items-center justify-center shadow-2xl shadow-primary/20 border-4 border-white dark:border-[#0f1115] rotate-3" }, [
          h('span', { class: "material-icons-round text-white text-4xl" }, 'local_fire_department')
        ])
      ]),

      h('div', { class: "mb-8 text-center" }, [
        h('h1', { class: "text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-2" }, 
          isLoginMode.value ? 'Identification UP' : 'Rejoindre l\'Arène'
        ),
        h('p', { class: "text-slate-500 dark:text-slate-400 font-medium text-sm" }, 
          isLoginMode.value ? 'Entre tes accès pour continuer.' : 'Crée ton compte étudiant en quelques secondes.'
        )
      ]),

      h('div', { class: "space-y-6 flex-1" }, [
        h('div', { class: "space-y-2" }, [
          h('label', { class: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1" }, "NUMÉRO DE TÉLÉPHONE"),
          h('div', { class: "flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[22px] px-6 py-4 focus-within:border-primary/50 transition-all shadow-inner" }, [
             h('span', { class: "text-lg mr-3" }, "📱"),
             h('input', { 
              value: phoneNumber.value, 
              onInput: handlePhoneInput,
              type: "tel", 
              placeholder: "01 97 00 00 00",
              class: "w-full bg-transparent border-none p-0 text-xl font-black tracking-widest text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-0"
            })
          ])
        ]),

        h('div', { class: "space-y-2" }, [
          h('label', { class: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1" }, "MOT DE PASSE"),
          h('div', { class: "flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[22px] px-6 py-4 focus-within:border-primary/50 transition-all shadow-inner" }, [
             h('span', { class: "text-lg mr-3" }, "🔒"),
             h('input', { 
              value: password.value, 
              onInput: (e: any) => password.value = e.target.value,
              type: showPassword.value ? "text" : "password", 
              placeholder: "••••••••",
              class: "w-full bg-transparent border-none p-0 text-xl font-black tracking-widest text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-0"
            }),
            h('button', { 
              onClick: () => showPassword.value = !showPassword.value,
              class: "text-slate-400" 
            }, [
              h('span', { class: "material-icons-round" }, showPassword.value ? 'visibility_off' : 'visibility')
            ])
          ])
        ]),

        h('div', { class: "pt-4" }, [
          h('button', { 
            onClick: () => phoneNumber.value.length >= 10 && password.value.length > 3 && emit('login', phoneNumber.value),
            disabled: phoneNumber.value.length < 10 || password.value.length < 4,
            class: "w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-[0_15px_30px_rgba(238,43,43,0.3)] active:scale-95 disabled:opacity-20 transition-all text-sm uppercase tracking-widest"
          }, isLoginMode.value ? 'Se connecter' : 'Créer mon compte')
        ]),

        h('div', { class: "flex flex-col items-center gap-4 pt-4" }, [
          isLoginMode.value ? [
            h('button', { class: "text-[10px] font-black uppercase tracking-widest text-slate-400" }, 'Mot de passe oublié ?'),
            h('div', { class: "flex items-center gap-2 w-full opacity-20" }, [
              h('div', { class: "flex-1 h-px bg-slate-400" }),
              h('span', { class: "text-[10px] font-black" }, 'OU'),
              h('div', { class: "flex-1 h-px bg-slate-400" }),
            ]),
            h('button', { 
              onClick: () => isLoginMode.value = false,
              class: "text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-6 py-3 rounded-full active:scale-95 transition-all" 
            }, 'S\'inscrire sur Flammes UP')
          ] : [
            h('button', { 
              onClick: () => isLoginMode.value = true,
              class: "text-xs font-black text-slate-400 uppercase tracking-widest" 
            }, 'J\'ai déjà un compte')
          ]
        ])
      ]),

      h('footer', { class: "mt-auto pt-10 text-center opacity-30" }, [
        h('p', { class: "text-[9px] font-black uppercase tracking-[0.4em]" }, "JJTECH'S • DIGITAL CAMPUS")
      ])
    ]);
  }
});
