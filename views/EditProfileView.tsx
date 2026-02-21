
import { defineComponent, ref, h, PropType } from 'vue';
import { db } from '../services/db';
import { UserProfile } from '../types';

export default defineComponent({
  name: 'EditProfileView',
  // Use PropType to give the user prop the correct structure for TypeScript
  props: { 
    user: { 
      type: Object as PropType<UserProfile>,
      required: true
    } 
  },
  emits: ['back', 'save'],
  setup(props, { emit }) {
    // Explicitly type the reactive form state as UserProfile
    const form = ref<UserProfile>({ ...props.user });
    const fileInputRef = ref<HTMLInputElement | null>(null);

    const triggerFilePicker = () => {
      fileInputRef.value?.click();
    };

    const handleFileChange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      // Compression basique et conversion Base64
      const reader = new FileReader();
      reader.onload = (event: any) => {
        if (event.target && typeof event.target.result === 'string') {
          form.value.avatar = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    };

    const onSave = () => {
      // db.saveProfile now receives a correctly typed UserProfile object
      db.saveProfile(form.value);
      emit('save', form.value);
    };

    return () => h('div', { class: "flex flex-col min-h-screen bg-white dark:bg-[#0f1115] pb-24" }, [
      h('input', {
        type: 'file',
        ref: fileInputRef,
        onChange: handleFileChange,
        accept: 'image/*',
        class: 'hidden'
      }),
      h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-[#0f1115]/80 ios-blur px-5 py-6 border-b border-primary/10 flex items-center justify-between" }, [
        h('button', { onClick: () => emit('back'), class: "text-slate-400 font-bold uppercase text-[10px] tracking-widest" }, 'Annuler'),
        h('h1', { class: "text-lg font-black" }, 'Mon Profil'),
        h('button', { 
          onClick: onSave, 
          class: "bg-primary text-white px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" 
        }, 'Sauver')
      ]),

      h('div', { class: "p-6 space-y-10" }, [
        h('div', { class: "flex flex-col items-center" }, [
          h('div', { 
            onClick: triggerFilePicker,
            class: "relative cursor-pointer group" 
          }, [
            h('div', { class: "w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-orange-500 shadow-2xl" }, [
              h('div', { class: "w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-[#0f1115] bg-slate-100 flex items-center justify-center" }, [
                form.value.avatar ? h('img', { src: form.value.avatar, class: "w-full h-full object-cover" }) : 
                h('img', { src: 'assets/default-avatar.svg', class: "w-full h-full object-cover" }),
              ])
            ]),
            h('div', { class: "absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full border-4 border-white dark:border-[#0f1115] flex items-center justify-center text-white shadow-xl" }, [
               h('span', { class: "material-icons-round text-sm" }, 'photo_camera')
            ])
          ]),
          h('p', { class: "mt-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]" }, 'Changer la photo')
        ]),

        h('div', { class: "space-y-6" }, [
          h('div', { class: "space-y-2" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 ml-4" }, 'Nom Complet'),
            h('input', { 
              value: form.value.name,
              onInput: (e: any) => form.value.name = e.target.value,
              class: "w-full bg-slate-100 dark:bg-white/5 border-none rounded-[28px] p-5 font-bold focus:ring-1 focus:ring-primary/30 dark:text-white"
            })
          ]),
          h('div', { class: "space-y-2" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 ml-4" }, 'Bio'),
            h('textarea', { 
              value: form.value.bio,
              onInput: (e: any) => form.value.bio = e.target.value,
              placeholder: "Dis-nous en plus sur toi...",
              class: "w-full h-32 bg-slate-100 dark:bg-white/5 border-none rounded-[28px] p-5 font-bold focus:ring-1 focus:ring-primary/30 resize-none dark:text-white"
            })
          ])
        ])
      ])
    ]);
  }
});
