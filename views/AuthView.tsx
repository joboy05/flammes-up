import { defineComponent, ref, h } from 'vue';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import { toast } from '../services/toast';

export default defineComponent({
  name: 'AuthView',
  emits: ['login', 'register', 'back', 'google-login'],
  setup(props, { emit }) {
    const phoneNumber = ref('');
    const password = ref('');
    const name = ref('');
    const faculty = ref('FLASH (Lettres & Arts)');
    const level = ref('Licence 1');
    const showPassword = ref(false);
    const isLoginMode = ref(true);
    const isLoading = ref(false);

    const faculties = [
      'FLASH (Lettres & Arts)',
      'FDSP (Droit & Sc. Po)',
      'FASEG (Eco & Gestion)',
      'FSS (Santé)',
      'IUT',
      'AGRO',
      'FAST'
    ];

    const levels = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat'];

    const handlePhoneInput = (e: any) => {
      const val = e.target.value.replace(/\D/g, '').slice(0, 15);
      phoneNumber.value = val;
    };

    const handleSubmit = async () => {
      if (phoneNumber.value.length < 8 || password.value.length < 4) return;
      if (!isLoginMode.value && !name.value) return;

      isLoading.value = true;
      try {
        if (isLoginMode.value) {
          emit('login', { phone: phoneNumber.value, password: password.value });
        } else {
          emit('register', {
            phone: phoneNumber.value,
            password: password.value,
            name: name.value,
            faculty: faculty.value,
            level: level.value
          });
        }
      } finally {
        // Le loading sera reset quand App.tsx redirige
        setTimeout(() => { isLoading.value = false; }, 3000);
      }
    };

    const handleGoogleSignIn = async () => {
      isLoading.value = true;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        emit('google-login', idToken);
      } catch (err: any) {
        console.error("Google Auth Error:", err);
        if (err.code !== 'auth/popup-closed-by-user') {
          toast.error("Erreur d'authentification Google");
        }
        isLoading.value = false;
      }
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

      h('div', { class: "space-y-6 flex-1 overflow-y-auto no-scrollbar pb-10" }, [
        // Registration fields
        !isLoginMode.value && h('div', { class: "space-y-4 animate-in fade-in slide-in-from-top-4 duration-500" }, [
          h('div', { class: "space-y-2" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1" }, "NOM COMPLET"),
            h('div', { class: "flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[22px] px-6 py-4 transition-all shadow-inner" }, [
              h('span', { class: "text-lg mr-3" }, "👤"),
              h('input', {
                value: name.value,
                onInput: (e: any) => name.value = e.target.value,
                placeholder: "Ex: Moussa Bakary",
                class: "w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-0"
              })
            ])
          ]),
          h('div', { class: "grid grid-cols-2 gap-4" }, [
            h('div', { class: "space-y-2" }, [
              h('label', { class: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1" }, "FACULTÉ"),
              h('select', {
                value: faculty.value,
                onChange: (e: any) => faculty.value = e.target.value,
                class: "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[22px] px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 appearance-none shadow-inner"
              }, faculties.map(f => h('option', { value: f }, f)))
            ]),
            h('div', { class: "space-y-2" }, [
              h('label', { class: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1" }, "NIVEAU"),
              h('select', {
                value: level.value,
                onChange: (e: any) => level.value = e.target.value,
                class: "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[22px] px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 appearance-none shadow-inner"
              }, levels.map(l => h('option', { value: l }, l)))
            ])
          ])
        ]),

        // Phone input
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

        // Password input
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

        // Submit button
        h('div', { class: "pt-4" }, [
          h('button', {
            onClick: handleSubmit,
            disabled: phoneNumber.value.length < 8 || password.value.length < 4 || (!isLoginMode.value && !name.value) || isLoading.value,
            class: "w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-[0_15px_30px_rgba(238,43,43,0.3)] active:scale-95 disabled:opacity-20 transition-all text-sm uppercase tracking-widest"
          }, isLoading.value ? 'Connexion...' : (isLoginMode.value ? 'S\'identifier' : 'Créer mon compte'))
        ]),

        h('div', { class: "flex items-center gap-4 py-2" }, [
          h('div', { class: "flex-1 h-px bg-slate-200 dark:bg-white/10" }),
          h('span', { class: "text-[10px] font-black text-slate-400 uppercase tracking-widest" }, "OU"),
          h('div', { class: "flex-1 h-px bg-slate-200 dark:bg-white/10" }),
        ]),

        h('button', {
          onClick: handleGoogleSignIn,
          disabled: isLoading.value,
          class: "w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest shadow-sm"
        }, [
          h('img', { src: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg', class: "w-5 h-5" }),
          'Continuer avec Google'
        ]),

        // Toggle login/register
        h('div', { class: "flex flex-col items-center gap-4 pt-4" }, [
          isLoginMode.value ? [
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
