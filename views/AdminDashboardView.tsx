
import { defineComponent, ref, h, onMounted } from 'vue';
import { db } from '../services/db';

export default defineComponent({
    name: 'AdminDashboardView',
    setup() {
        const stats = ref({ userCount: 0, activeStories: 0 });
        const recentUsers = ref<any[]>([]);
        const isLoading = ref(true);

        onMounted(async () => {
            try {
                const data = await db.getGlobalStats() as any;
                stats.value = data;

                db.subscribeUsers((users) => {
                    recentUsers.value = users.slice(0, 5); // Just show top 5 for overview
                });
            } catch (e) {
                console.error("Admin stats error:", e);
            } finally {
                isLoading.value = false;
            }
        });

        return () => h('div', { class: "flex flex-col min-h-full p-8 pb-24 space-y-8 animate-in fade-in" }, [
            h('div', [
                h('h1', { class: "text-4xl font-black tracking-tighter" }, "Arène Admin"),
                h('p', { class: "text-slate-500 dark:text-slate-400 font-medium text-sm mt-2" }, "Statistiques globales en temps réel.")
            ]),

            isLoading.value ? h('div', { class: "flex justify-center p-20" }, [
                h('div', { class: "w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" })
            ]) : h('div', { class: "grid grid-cols-1 sm:grid-cols-2 gap-6" }, [
                h('div', { class: "bg-white dark:bg-white/5 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl" }, [
                    h('div', { class: "flex items-center gap-4 mb-4" }, [
                        h('div', { class: "w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center" }, [
                            h('span', { class: "material-icons-round text-2xl" }, 'people')
                        ]),
                        h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40" }, "Inscrits")
                    ]),
                    h('p', { class: "text-5xl font-black tracking-tighter" }, stats.value.userCount || 0),
                    h('p', { class: "text-[10px] font-bold mt-2 opacity-30" }, "Utilisateurs totaux sur le campus")
                ]),

                h('div', { class: "bg-white dark:bg-white/5 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl" }, [
                    h('div', { class: "flex items-center gap-4 mb-4" }, [
                        h('div', { class: "w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center" }, [
                            h('span', { class: "material-icons-round text-2xl" }, 'bolt')
                        ]),
                        h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40" }, "Stories 24h")
                    ]),
                    h('p', { class: "text-5xl font-black tracking-tighter" }, stats.value.activeStories || 0),
                    h('p', { class: "text-[10px] font-bold mt-2 opacity-30" }, "Étincelles actives en ce moment")
                ])
            ]),

            h('div', { class: "bg-primary/5 p-8 rounded-[40px] border border-primary/10" }, [
                h('div', { class: "flex items-center justify-between mb-6" }, [
                    h('h3', { class: "font-black text-primary uppercase text-xs tracking-widest" }, "Derniers Inscrits"),
                    h('span', { class: "text-[10px] font-bold text-primary/50" }, "Live Feed")
                ]),
                h('div', { class: "space-y-3" }, [
                    recentUsers.value.length === 0 ? h('p', { class: "text-center py-4 text-xs opacity-40 font-bold" }, "Aucun utilisateur trouvé.") :
                        recentUsers.value.map(user => h('div', {
                            class: "flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5"
                        }, [
                            h('div', { class: "flex items-center gap-3" }, [
                                h('div', { class: "w-8 h-8 rounded-full bg-slate-100 overflow-hidden" }, [
                                    h('img', { src: user.avatar || '/assets/default-avatar.svg', class: "w-full h-full object-cover" })
                                ]),
                                h('div', [
                                    h('p', { class: "text-xs font-bold" }, user.name),
                                    h('p', { class: "text-[10px] opacity-40 capitalize" }, `${user.faculty} • ${user.level}`)
                                ])
                            ]),
                            h('div', { class: "flex items-center gap-1 text-primary" }, [
                                h('span', { class: "text-[10px] font-black" }, user.vibesReceived || 0),
                                h('span', { class: "material-icons-round text-xs" }, 'favorite')
                            ])
                        ]))
                ])
            ]),

            h('div', { class: "grid grid-cols-2 gap-3" }, [
                h('button', { class: "p-6 bg-white dark:bg-white/5 rounded-[32px] text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5 active:scale-95 transition-all text-left group" }, [
                    h('div', { class: "w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors" }, [
                        h('span', { class: "material-icons-round" }, 'verified_user')
                    ]),
                    "Vérifier IDs"
                ]),
                h('button', { class: "p-6 bg-white dark:bg-white/5 rounded-[32px] text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5 active:scale-95 transition-all text-left group" }, [
                    h('div', { class: "w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500 group-hover:text-white transition-colors" }, [
                        h('span', { class: "material-icons-round" }, 'gavel')
                    ]),
                    "Suprématie"
                ])
            ])
        ]);
    }
});
