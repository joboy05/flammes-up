
import { defineComponent, ref, h, PropType } from 'vue';
import { db } from '../services/db';
import { UserProfile } from '../types';
import { toast } from '../services/toast';

export default defineComponent({
  name: 'EditProfileView',
  props: {
    user: {
      type: Object as PropType<UserProfile>,
      required: true
    }
  },
  emits: ['back', 'save'],
  setup(props, { emit }) {
    const form = ref<UserProfile>({
      ...props.user,
      gallery: props.user.gallery || []
    });

    const fileInputRef = ref<HTMLInputElement | null>(null);
    const galleryInputRef = ref<HTMLInputElement | null>(null);

    const residences = [
      'externe',
      'BADEA-A',
      'BADEA-B',
      'Mohamed-VI',
      'Batiment B',
      'Batiment C',
      'Batiment D',
      'Batiment E'
    ];

    const triggerAvatarPicker = () => fileInputRef.value?.click();
    const triggerGalleryPicker = () => galleryInputRef.value?.click();

    const handleAvatarChange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event: any) => {
        if (event.target && typeof event.target.result === 'string') {
          form.value.avatar = event.target.result;
        }
      };
      reader.readAsDataURL(file);
    };

    const handleGalleryChange = (e: any) => {
      const files = e.target.files;
      if (!files.length) return;

      Array.from(files).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          if (event.target && typeof event.target.result === 'string') {
            if (!form.value.gallery) form.value.gallery = [];
            form.value.gallery.push(event.target.result);
          }
        };
        reader.readAsDataURL(file);
      });
      toast.success(`${files.length} média(s) ajouté(s)`);
    };

    const removeFromGallery = (index: number) => {
      form.value.gallery?.splice(index, 1);
    };

    const onSave = async () => {
      try {
        db.saveProfile(form.value);
        if ((props.user as any).id) {
          await db.updateProfile((props.user as any).id, form.value);
        }
        emit('save', form.value);
        toast.success("Profil mis à jour ! ✨");
      } catch (err) {
        toast.error("Erreur lors de la sauvegarde");
      }
    };

    return () => h('div', { class: "flex flex-col min-h-screen bg-white dark:bg-[#0f1115] pb-32 overflow-y-auto" }, [
      h('input', { type: 'file', ref: fileInputRef, onChange: handleAvatarChange, accept: 'image/*', class: 'hidden' }),
      h('input', { type: 'file', ref: galleryInputRef, onChange: handleGalleryChange, accept: 'image/*,video/*', multiple: true, class: 'hidden' }),

      h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-[#0f1115]/80 ios-blur px-5 py-6 border-b border-primary/10 flex items-center justify-between" }, [
        h('button', { onClick: () => emit('back'), class: "text-slate-400 font-bold uppercase text-[10px] tracking-widest" }, 'Annuler'),
        h('h1', { class: "text-lg font-black" }, 'Modifier le Profil'),
        h('button', { onClick: onSave, class: "bg-primary text-white px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" }, 'Sauver')
      ]),

      h('div', { class: "p-6 space-y-10" }, [
        // Avatar section
        h('div', { class: "flex flex-col items-center" }, [
          h('div', { onClick: triggerAvatarPicker, class: "relative cursor-pointer group" }, [
            h('div', { class: "w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-orange-500 shadow-2xl" }, [
              h('div', { class: "w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-[#0f1115] bg-slate-100 flex items-center justify-center" }, [
                h('img', { src: form.value.avatar || 'assets/default-avatar.svg', class: "w-full h-full object-cover" }),
              ])
            ]),
            h('div', { class: "absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full border-4 border-white dark:border-[#0f1115] flex items-center justify-center text-white shadow-xl" }, [
              h('span', { class: "material-icons-round text-sm" }, 'photo_camera')
            ])
          ]),
          h('p', { class: "mt-4 text-[10px] font-black text-primary uppercase tracking-[0.2em]" }, 'Photo de profil')
        ]),

        // Main fields
        h('div', { class: "space-y-6" }, [
          // Name
          h('div', { class: "space-y-2" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 ml-4" }, 'Nom Complet'),
            h('input', {
              value: form.value.name,
              onInput: (e: any) => form.value.name = e.target.value,
              class: "w-full bg-slate-100 dark:bg-white/5 border-none rounded-[24px] p-5 font-bold focus:ring-1 focus:ring-primary/30 dark:text-white outline-none"
            })
          ]),

          // Email
          h('div', { class: "space-y-2 opacity-60" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 ml-4" }, 'Email (Non modifiable)'),
            h('input', {
              value: form.value.email,
              disabled: true,
              placeholder: "Email non défini",
              class: "w-full bg-slate-100 dark:bg-white/5 border-none rounded-[24px] p-5 font-bold dark:text-white outline-none cursor-not-allowed"
            })
          ]),

          // Bio
          h('div', { class: "space-y-2" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 ml-4" }, 'Bio'),
            h('textarea', {
              value: form.value.bio,
              onInput: (e: any) => form.value.bio = e.target.value,
              placeholder: "Dis-nous en plus sur toi...",
              class: "w-full h-24 bg-slate-100 dark:bg-white/5 border-none rounded-[24px] p-5 font-bold focus:ring-1 focus:ring-primary/30 resize-none dark:text-white outline-none"
            })
          ]),

          // Grid for status and residence
          h('div', { class: "grid grid-cols-2 gap-4" }, [
            h('div', { class: "space-y-2" }, [
              h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 ml-4" }, 'Statut Marital'),
              h('select', {
                value: form.value.maritalStatus,
                onChange: (e: any) => form.value.maritalStatus = e.target.value,
                class: "w-full bg-slate-100 dark:bg-white/5 border-none rounded-[24px] p-5 font-bold focus:ring-1 focus:ring-primary/30 dark:text-white outline-none"
              }, [
                h('option', { value: 'celibataire' }, "Célibataire"),
                h('option', { value: 'en_couple' }, "En couple"),
                h('option', { value: 'marie' }, "Marié(e)"),
                h('option', { value: 'complique' }, "Compliqué"),
                h('option', { value: 'non_defini' }, "Secret")
              ])
            ]),
            h('div', { class: "space-y-2" }, [
              h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 ml-4" }, 'Résidence'),
              h('select', {
                value: form.value.residence,
                onChange: (e: any) => form.value.residence = e.target.value,
                class: "w-full bg-slate-100 dark:bg-white/5 border-none rounded-[24px] p-5 font-bold focus:ring-1 focus:ring-primary/30 dark:text-white outline-none"
              }, residences.map(r => h('option', { value: r }, r === 'externe' ? 'Externe' : r)))
            ])
          ]),

          // Faculty and Level
          h('div', { class: "grid grid-cols-2 gap-4" }, [
            h('div', { class: "space-y-2" }, [
              h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 ml-4" }, 'Filière'),
              h('input', {
                value: form.value.faculty,
                onInput: (e: any) => form.value.faculty = e.target.value,
                class: "w-full bg-slate-100 dark:bg-white/5 border-none rounded-[24px] p-5 font-bold focus:ring-1 focus:ring-primary/30 dark:text-white outline-none"
              })
            ]),
            h('div', { class: "space-y-2" }, [
              h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 ml-4" }, 'Niveau'),
              h('input', {
                value: form.value.level,
                onInput: (e: any) => form.value.level = e.target.value,
                placeholder: "Ex: Licence 1",
                class: "w-full bg-slate-100 dark:bg-white/5 border-none rounded-[24px] p-5 font-bold focus:ring-1 focus:ring-primary/30 dark:text-white outline-none"
              })
            ])
          ]),

          // Gallery Section
          h('div', { class: "space-y-4" }, [
            h('div', { class: "flex items-center justify-between ml-4" }, [
              h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40" }, 'Galerie Photos & Vidéos'),
              h('button', {
                onClick: triggerGalleryPicker,
                class: "text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
              }, [
                h('span', { class: "material-icons-round text-sm" }, 'add_circle'),
                'Ajouter'
              ])
            ]),

            h('div', { class: "grid grid-cols-3 gap-3" }, [
              ...(form.value.gallery || []).map((media, idx) => h('div', {
                class: "relative aspect-square rounded-[18px] overflow-hidden bg-slate-100 dark:bg-white/5 group"
              }, [
                h('img', { src: media, class: "w-full h-full object-cover" }),
                h('button', {
                  onClick: () => removeFromGallery(idx),
                  class: "absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                }, [
                  h('span', { class: "material-icons-round text-xs" }, 'close')
                ])
              ])),
              // Placeholder for adding if empty
              (!form.value.gallery?.length) ? h('div', {
                onClick: triggerGalleryPicker,
                class: "aspect-square rounded-[18px] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
              }, [
                h('span', { class: "material-icons-round" }, 'add_a_photo'),
                h('span', { class: "text-[8px] font-black uppercase" }, 'Ajouter')
              ]) : null
            ])
          ])
        ])
      ])
    ]);
  }
});
