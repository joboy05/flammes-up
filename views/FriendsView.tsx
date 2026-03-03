import { defineComponent, ref, h, onMounted } from 'vue';
import { api } from '../services/api';

export default defineComponent({
    name: 'FriendsView',
    emits: ['back', 'navigate'],
    setup(props, { emit }) {
        const activeTab = ref('friends');
        const friends = ref<any[]>([]);
        const requests = ref<any[]>([]);
        const isLoading = ref(true);

        const fetchData = async () => {
            isLoading.value = true;
            try {
                const [friendsRes, requestsRes] = await Promise.all([
                    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/friends/list', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('up_token')}` }
                    }),
                    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/friends/requests', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('up_token')}` }
                    })
                ]);

                if (friendsRes.ok) friends.value = await friendsRes.json();
                if (requestsRes.ok) requests.value = await requestsRes.json();
            } catch (e) {
                console.error("Erreur chargement amis:", e);
            } finally {
                isLoading.value = false;
            }
        };

        const acceptRequest = async (requestId: string) => {
            try {
                const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/friends/accept', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('up_token')}`
                    },
                    body: JSON.stringify({ requestId })
                });
                if (res.ok) {
                    fetchData();
                }
            } catch (e) { }
        };

        onMounted(fetchData);

        return () => h('div', { class: "flex flex-col min-h-full bg-background-light dark:bg-background-dark" }, [
            h('header', { class: "sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 ios-blur px-5 pt-12 pb-4 border-b border-primary/10" }, [
                h('div', { class: "flex items-center gap-4 mb-6" }, [
                    h('button', { onClick: () => emit('back'), class: "w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center" }, [
                        h('span', { class: "material-icons-round" }, 'arrow_back')
                    ]),
                    h('h1', { class: "text-2xl font-bold tracking-tight" }, 'Mes Amis')
                ]),

                h('div', { class: "flex gap-4 border-b border-primary/5" }, [
                    h('button', {
                        onClick: () => activeTab.value = 'friends',
                        class: `pb-2 text-sm font-bold transition-all ${activeTab.value === 'friends' ? 'text-primary border-b-2 border-primary' : 'opacity-40'}`
                    }, `Amis (${friends.value.length})`),
                    h('button', {
                        onClick: () => activeTab.value = 'requests',
                        class: `pb-2 text-sm font-bold transition-all ${activeTab.value === 'requests' ? 'text-primary border-b-2 border-primary' : 'opacity-40'}`
                    }, `Demandes (${requests.value.length})`)
                ])
            ]),

            h('div', { class: "flex-1 p-5" }, [
                activeTab.value === 'friends' ? h('div', { class: "grid gap-4" },
                    friends.value.length > 0 ? friends.value.map(f => h('div', {
                        key: f.phone,
                        class: "flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-primary/5"
                    }, [
                        h('div', { class: "w-12 h-12 rounded-full bg-primary/10 overflow-hidden" }, [
                            f.avatar ? h('img', { src: f.avatar, class: "w-full h-full object-cover" }) :
                                h('div', { class: "w-full h-full flex items-center justify-center text-primary font-bold" }, f.name[0])
                        ]),
                        h('div', { class: "flex-1" }, [
                            h('h3', { class: "font-bold text-sm" }, f.name),
                            h('p', { class: "text-[10px] opacity-40 uppercase font-black" }, f.faculty || 'Étudiant')
                        ]),
                        h('button', {
                            onClick: () => emit('navigate', 'chat', { friend: f.phone }),
                            class: "w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"
                        }, [
                            h('span', { class: "material-icons-round text-sm" }, 'chat')
                        ])
                    ])) : h('p', { class: "text-center py-10 opacity-30 text-xs italic" }, "Pas encore d'amis... va au Hub !")
                ) : h('div', { class: "grid gap-4" },
                    requests.value.length > 0 ? requests.value.map(r => h('div', {
                        key: r.id,
                        class: "flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-primary/5"
                    }, [
                        h('div', { class: "w-12 h-12 rounded-full bg-primary/10 overflow-hidden" }, [
                            r.avatar ? h('img', { src: r.avatar, class: "w-full h-full object-cover" }) :
                                h('div', { class: "w-full h-full flex items-center justify-center text-primary font-bold" }, r.name[0])
                        ]),
                        h('div', { class: "flex-1" }, [
                            h('h3', { class: "font-bold text-sm" }, r.name),
                            h('p', { class: "text-[10px] opacity-40 uppercase" }, "Veut être ton ami")
                        ]),
                        h('div', { class: "flex gap-2" }, [
                            h('button', {
                                onClick: () => acceptRequest(r.id),
                                class: "px-3 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase"
                            }, 'Accepter')
                        ])
                    ])) : h('p', { class: "text-center py-10 opacity-30 text-xs italic" }, "Aucune demande en attente")
                )
            ])
        ]);
    }
});
