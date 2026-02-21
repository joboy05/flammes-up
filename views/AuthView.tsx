import { defineComponent, ref, h, onMounted } from 'vue';
import { auth, googleProvider } from '../services/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from "firebase/auth";

export default defineComponent({
  name: 'AuthView',
  emits: ['login', 'register', 'back'],
  setup(props, { emit }) {
    const phoneNumber = ref('');
    const password = ref('');
    const name = ref('');
    const faculty = ref('FLASH (Lettres & Arts)');
    const level = ref('Licence 1');
    const showPassword = ref(false);
    const isLoginMode = ref(true);
    const otpSent = ref(false);
    const otpCode = ref('');
    const confirmationResult = ref<any>(null);
    const isLoading = ref(false);

    onMounted(() => {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
    });

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
      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
      phoneNumber.value = val;
    };

    const sendOtp = async () => {
      if (phoneNumber.value.length < 8) return;

      // --- BYPASS ADMIN reCAPTCHA/SMS ---
      if (phoneNumber.value === '0151852420') {
        emit('login', { phone: phoneNumber.value, password: password.value });
        return;
      }

      isLoading.value = true;
      try {
        // Formatage pour le Bénin (+229) if number is local 8 digits or 10 digits
        // Formatage pour le Bénin (+229)
        let formattedPhone = phoneNumber.value;
        if (formattedPhone.length === 8) {
          formattedPhone = '+229' + formattedPhone;
        } else if (formattedPhone.length === 10) {
          // Si le numéro commence par un '0', on peut soit le garder (selon les opérateurs) soit l'enlever.
          // Pour Firebase/Bénin, le format standard est +229 suivi des 10 chiffres ou +229 suivi des 10 chiffres sans le 0 initial.
          // On va opter pour le format international complet.
          if (formattedPhone.startsWith('0')) {
            formattedPhone = '+229' + formattedPhone;
          } else {
            formattedPhone = '+229' + formattedPhone;
          }
        } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+' + formattedPhone;
        }

        const appVerifier = (window as any).recaptchaVerifier;
        confirmationResult.value = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        otpSent.value = true;
      } catch (err: any) {
        console.error("Erreur OTP:", err);
        alert("Erreur lors de l'envoi du SMS. Vérifiez le numéro ou réessayez.");
      } finally {
        isLoading.value = false;
      }
    };

    const verifyOtp = async () => {
      if (otpCode.value.length < 6) return;
      isLoading.value = true;
      try {
        const result = await confirmationResult.value.confirm(otpCode.value);
        // OTP validé, maintenant on déclenche le login ou register réel
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
      } catch (err) {
        alert("Code incorrect. Réessaye.");
      } finally {
        isLoading.value = false;
      }
    };

    const handleGoogleSignIn = async () => {
      isLoading.value = true;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        emit('login', {
          phone: user.phoneNumber || user.email || 'google_user',
          googleUser: user
        });
      } catch (err: any) {
        console.error("Erreur Google SignIn:", err);
      } finally {
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

      h('div', { id: 'recaptcha-container' }),

      h('div', { class: "mb-8 text-center" }, [
        h('h1', { class: "text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-2" },
          otpSent.value ? 'Vérification SMS' : (isLoginMode.value ? 'Identification UP' : 'Rejoindre l\'Arène')
        ),
        h('p', { class: "text-slate-500 dark:text-slate-400 font-medium text-sm" },
          otpSent.value ? `Saisis le code envoyé au ${phoneNumber.value}` : (isLoginMode.value ? 'Entre tes accès pour continuer.' : 'Crée ton compte étudiant en quelques secondes.')
        )
      ]),

      h('div', { class: "space-y-6 flex-1 overflow-y-auto no-scrollbar pb-10" }, [
        // OTP Mode
        otpSent.value ? h('div', { class: "space-y-6 animate-in fade-in zoom-in-95" }, [
          h('div', { class: "space-y-2" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1" }, "CODE DE VÉRIFICATION"),
            h('div', { class: "flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[22px] px-6 py-4 transition-all shadow-inner" }, [
              h('span', { class: "text-lg mr-3" }, "🔢"),
              h('input', {
                value: otpCode.value,
                onInput: (e: any) => otpCode.value = e.target.value.replace(/\D/g, '').slice(0, 6),
                placeholder: "000000",
                type: "tel",
                class: "w-full bg-transparent border-none p-0 text-3xl font-black tracking-[0.5em] text-center text-primary placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-0"
              })
            ])
          ]),
          h('button', {
            onClick: verifyOtp,
            disabled: otpCode.value.length < 6 || isLoading.value,
            class: "w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-[0_15px_30px_rgba(238,43,43,0.3)] active:scale-95 disabled:opacity-20 transition-all text-sm uppercase tracking-widest"
          }, isLoading.value ? 'Vérification...' : 'Valider le code'),
          h('button', {
            onClick: () => otpSent.value = false,
            class: "w-full text-xs font-black text-slate-400 uppercase tracking-widest"
          }, "Modifier le numéro")
        ]) : [
          // Registration/Login Mode
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
              onClick: sendOtp,
              disabled: phoneNumber.value.length < 8 || password.value.length < 4 || (!isLoginMode.value && !name.value) || isLoading.value,
              class: "w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-[0_15px_30px_rgba(238,43,43,0.3)] active:scale-95 disabled:opacity-20 transition-all text-sm uppercase tracking-widest"
            }, isLoading.value ? 'Envoi...' : (isLoginMode.value ? 'S\'identifier' : 'Vérifier mon numéro'))
          ]),

          h('div', { class: "flex flex-col items-center gap-4 pt-4" }, [
            isLoginMode.value ? [
              h('button', { class: "text-[10px] font-black uppercase tracking-widest text-slate-400" }, 'Mot de passe oublié ?'),
              h('div', { class: "flex items-center gap-2 w-full opacity-20" }, [
                h('div', { class: "flex-1 h-px bg-slate-400" }),
                h('span', { class: "text-[10px] font-black" }, 'OU'),
                h('div', { class: "flex-1 h-px bg-slate-400" }),
              ]),
              h('div', { class: "flex items-center gap-2 w-full opacity-20" }, [
                h('div', { class: "flex-1 h-px bg-slate-400" }),
                h('span', { class: "text-[10px] font-black" }, 'OU'),
                h('div', { class: "flex-1 h-px bg-slate-400" }),
              ]),
              h('button', {
                onClick: handleGoogleSignIn,
                class: "w-full py-5 rounded-[24px] border border-slate-200 dark:border-white/10 flex items-center justify-center gap-4 active:scale-95 transition-all"
              }, [
                h('img', { src: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg', class: "w-6 h-6" }),
                h('span', { class: "text-xs font-black uppercase tracking-widest" }, "Continuer avec Google")
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
        ]
      ]),

      h('footer', { class: "mt-auto pt-10 text-center opacity-30" }, [
        h('p', { class: "text-[9px] font-black uppercase tracking-[0.4em]" }, "JJTECH'S • DIGITAL CAMPUS")
      ])
    ]);
  }
});
