
import { defineComponent, ref, onMounted, computed, h } from 'vue';
import { api } from '../services/api';
import { UserProfile } from '../types';

export default defineComponent({
    name: 'DiscoveryView',
    emits: ['back', 'startChat'],
    setup(props, { emit }) {
        const users = ref<UserProfile[]>([]);
        const searchQuery = ref('');
        const isLoading = ref(true);

        onMounted(async () => {
            try {
                const data = await api.getUsers();
                users.value = data.users || [];
            } catch (err) {
                console.error("Erreur chargement utilisateurs:", err);
            } finally {
                isLoading.value = false;
            }
        });

        const filteredUsers = computed(() => {
            const query = searchQuery.value.toLowerCase();
            if (!query) return users.value;
            return users.value.filter(u =>
                u.name?.toLowerCase().includes(query) ||
                u.faculty?.toLowerCase().includes(query) ||
                u.phone?.includes(query)
            );
        });

        return () => h('div', { class: "min-h-full bg-white dark:bg-[#0f1115] flex flex-col" }, [
            // Header
            h('header', { class: "px-6 py-12 bg-accent rounded-b-[40px] text-white shadow-2xl relative overflow-hidden" }, [
                h('div', { class: "absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" }),
                h('button', { onClick: () => emit('back'), class: "mb-6 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md active:scale-95" }, [
                    h('span', { class: "material-icons-round" }, 'arrow_back')
                ]),
                h('h1', { class: "text-3xl font-black tracking-tighter" }, "Découvrir"),
                h('p', { class: "text-white/70 text-sm font-bold uppercase tracking-widest mt-1" }, "Retrouve tes amis sur le campus")
            ]),

            // Search Bar
            h('div', { class: "px-6 -mt-8 relative z-10" }, [
                h('div', { class: "bg-white dark:bg-[#1a1d23] p-2 rounded-[24px] shadow-xl border border-black/5 flex items-center gap-3 px-4" }, [
                    h('span', { class: "material-icons-round text-slate-400" }, 'search'),
                    h('input', {
                        value: searchQuery.value,
                        onInput: (e: any) => searchQuery.value = e.target.value,
                        placeholder: "Nom, filière ou numéro...",
                        class: "flex-1 bg-transparent border-none text-sm focus:ring-0 py-3 dark:text-white"
                    })
                ])
            ]),

            // Users List
            h('div', { class: "flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar pb-24" }, [
                isLoading.value ? h('div', { class: "flex flex-col items-center justify-center py-20 opacity-40" }, [
                    h('span', { class: "material-icons-round animate-spin text-4xl mb-4" }, 'refresh'),
                    h('p', { class: "font-bold text-xs uppercase tracking-widest" }, "Chargement des étudiants...")
                ]) : (filteredUsers.value.length > 0 ? filteredUsers.value.map(user => h('div', {
                    key: user.phone,
                    class: "bg-white dark:bg-primary/5 border border-primary/10 p-4 rounded-[28px] flex items-center gap-4 shadow-sm"
                }, [
                    h('img', {
                        src: user.avatar || '/assets/default-avatar.svg',
                        class: "w-14 h-14 rounded-full border-2 border-primary/20 object-cover bg-slate-100"
                    }),
                    h('div', { class: "flex-1" }, [
                        h('h3', { class: "font-black text-[15px]" }, user.name),
                        h('p', { class: "text-[10px] font-bold text-primary uppercase" }, user.faculty || 'Non défini')
                    ]),
                    h('button', {
                        onClick: () => emit('startChat', user.phone, user.name, user.avatar),
                        class: "bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                    }, [
                        h('span', { class: "material-icons-round text-lg" }, 'chat_bubble')
                    ])
                ])) : h('div', { class: "text-center py-20 opacity-30" }, [
                    h('span', { class: "material-icons-round text-5xl mb-4" }, 'person_search'),
                    h('p', { class: "font-black" }, "Aucun étudiant trouvé")
                ]))
            ])
        ]);
    }
});
