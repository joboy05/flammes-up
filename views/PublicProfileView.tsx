import { defineComponent, h, ref, onMounted, PropType } from 'vue';
import { api } from '../services/api';
import { UserProfile } from '../types';
import { toast } from '../services/toast';

export default defineComponent({
    name: 'PublicProfileView',
    props: {
        phone: { type: String, required: true }
    },
    emits: ['back', 'startChat'],
    setup(props, { emit }) {
        const user = ref<UserProfile | null>(null);
        const isLoading = ref(true);
        const defaultAvatar = '/assets/default-avatar.svg';

        onMounted(async () => {
            try {
                const data = await api.getPublicProfile(props.phone);
                user.value = data.user;
            } catch (err) {
                toast.error("Impossible de charger ce profil");
                emit('back');
            } finally {
                isLoading.value = false;
            }
        });

        return () => h('div', { class: "flex flex-col min-h-full bg-white dark:bg-[#0f1115] pb-20" }, [
            isLoading.value ? h('div', { class: "flex items-center justify-center py-20" }, [
                h('div', { class: "w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" })
            ]) : (user.value ? h('div', { class: "animate-in fade-in slide-in-from-bottom duration-500" }, [
                // Header with Back Button
                h('div', { class: "relative h-48 bg-gradient-to-b from-primary/20 to-transparent" }, [
                    h('button', {
                        onClick: () => emit('back'),
                        class: "absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-slate-800 dark:text-white"
                    }, [h('span', { class: "material-icons-round" }, 'arrow_back')])
                ]),

                h('div', { class: "px-8 -mt-20 space-y-8" }, [
                    // Avatar & Badge
                    h('div', { class: "flex flex-col items-center text-center" }, [
                        h('div', { class: `w-32 h-32 rounded-full p-1.5 ${user.value.hasStory ? 'bg-gradient-to-tr from-primary via-orange-500 to-rose-500' : 'bg-slate-200 dark:bg-white/10'}` }, [
                            h('div', { class: "w-full h-full rounded-full border-4 border-white dark:border-[#0f1115] overflow-hidden bg-slate-100" }, [
                                h('img', {
                                    src: user.value.avatar || defaultAvatar,
                                    class: "w-full h-full object-cover"
                                })
                            ])
                        ]),
                        h('h2', { class: "text-3xl font-black mt-6" }, user.value.name),
                        h('p', { class: "text-slate-500 dark:text-slate-400 font-medium text-sm mt-2 px-6 italic" }, user.value.bio || "Aucune bio définie."),
                        h('div', { class: "mt-4 bg-primary/10 px-5 py-2 rounded-full flex items-center gap-2 border border-primary/20" }, [
                            h('span', { class: "material-icons-round text-primary text-base" }, 'verified'),
                            h('span', { class: "text-[10px] font-black uppercase text-primary tracking-[0.2em]" }, 'Étudiant UP Verified')
                        ])
                    ]),

                    // Stats
                    h('div', { class: "grid grid-cols-2 gap-4" }, [
                        h('div', { class: "bg-white dark:bg-white/5 p-6 rounded-[35px] border border-slate-100 dark:border-white/5 text-center" }, [
                            h('p', { class: "text-3xl font-black text-primary tracking-tighter" }, user.value.vibesReceived || 0),
                            h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" }, 'Vibes')
                        ]),
                        h('div', { class: "bg-white dark:bg-white/5 p-6 rounded-[35px] border border-slate-100 dark:border-white/5 text-center" }, [
                            h('p', { class: "text-3xl font-black tracking-tighter text-slate-900 dark:text-white" }, user.value.upPoints || 0),
                            h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mt-1" }, 'Points UP')
                        ])
                    ]),

                    // Info Cards
                    h('div', { class: "bg-white dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/5 overflow-hidden" }, [
                        [
                            { label: 'Faculté', val: user.value.faculty, icon: 'school', color: 'text-primary' },
                            { label: 'Niveau', val: user.value.level || 'Non défini', icon: 'trending_up', color: 'text-indigo-500' },
                            { label: 'Statut', val: user.value.maritalStatus === 'non_defini' ? 'Secret' : user.value.maritalStatus, icon: 'favorite', color: 'text-rose-500' },
                            { label: 'Résidence', val: user.value.residence === 'externe' ? 'Externe' : user.value.residence, icon: 'location_city', color: 'text-amber-500' }
                        ].map((item, idx) => h('div', {
                            class: `flex items-center gap-4 p-6 ${idx !== 0 ? 'border-t border-slate-100 dark:border-white/5' : ''}`
                        }, [
                            h('div', { class: `w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center ${item.color}` }, [
                                h('span', { class: "material-icons-round text-2xl" }, item.icon)
                            ]),
                            h('div', [
                                h('p', { class: "text-[9px] font-black uppercase tracking-widest opacity-40 mb-1" }, item.label),
                                h('p', { class: "text-sm font-bold" }, item.val)
                            ])
                        ]))
                    ]),

                    // Gallery
                    user.value.gallery && user.value.gallery.length > 0 ? h('div', { class: "space-y-4" }, [
                        h('h3', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 px-2" }, 'Galerie UP'),
                        h('div', { class: "grid grid-cols-2 gap-3" }, user.value.gallery.map((media: string) => h('div', {
                            class: "aspect-square rounded-[35px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm bg-slate-50 dark:bg-white/5"
                        }, [
                            h('img', { src: media, class: "w-full h-full object-cover" })
                        ])))
                    ]) : null,

                    // Actions
                    h('div', { class: "flex gap-3" }, [
                        h('button', {
                            onClick: () => emit('startChat', user.value?.phone, user.value?.name, user.value?.avatar),
                            class: "flex-1 py-5 rounded-[28px] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        }, [
                            h('span', { class: "material-icons-round" }, 'message'),
                            "Lancer un Chat"
                        ]),
                        h('button', {
                            class: "w-16 h-16 rounded-[28px] border border-primary/20 flex items-center justify-center text-primary active:scale-95 transition-all"
                        }, [h('span', { class: "material-icons-round text-2xl" }, 'favorite_border')])
                    ])
                ])
            ]) : h('div', { class: "flex items-center justify-center py-20 opacity-40" }, "Profil indisponible"))
        ]);
    }
});
