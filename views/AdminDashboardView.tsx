import { defineComponent, ref, h, onMounted, computed } from 'vue';
import { api } from '../services/api';
import { toast } from '../services/toast';

export default defineComponent({
    name: 'AdminDashboardView',
    props: { onBack: Function },
    setup(props) {
        const stats = ref({ userCount: 0, activeStories: 0, postCount: 0 });
        const allUsers = ref<any[]>([]);
        const isLoading = ref(true);
        const currentView = ref<'stats' | 'users' | 'moderation'>('stats');
        const searchQuery = ref('');

        const loadData = async () => {
            isLoading.value = true;
            try {
                const [s, u] = await Promise.all([
                    api.getAdminStats(),
                    api.adminGetAllUsers()
                ]);
                stats.value = s;
                allUsers.value = u.users || [];
            } catch (e) {
                console.error("Admin load error:", e);
                toast.error("Erreur de chargement des données admin");
            } finally {
                isLoading.value = false;
            }
        };

        onMounted(loadData);

        const filteredUsers = computed(() => {
            if (!searchQuery.value) return allUsers.value;
            const q = searchQuery.value.toLowerCase();
            return allUsers.value.filter(u =>
                (u.name || '').toLowerCase().includes(q) ||
                (u.phone || '').includes(q)
            );
        });

        const toggleUserStatus = async (user: any) => {
            const newStatus = user.status === 'banned' ? 'active' : 'banned';
            if (!confirm(`Voulez-vous vraiment passer l'utilisateur en ${newStatus} ?`)) return;

            try {
                await api.adminUpdateUser(user.phone, { status: newStatus });
                user.status = newStatus;
                toast.success(`Statut mis à jour pour ${user.name}`);
            } catch (e) {
                toast.error("Erreur lors de la mise à jour");
            }
        };

        const changeRole = async (user: any) => {
            const newRole = user.role === 'admin' ? 'user' : 'admin';
            if (!confirm(`Changer le rôle de ${user.name} en ${newRole} ?`)) return;

            try {
                await api.adminUpdateUser(user.phone, { role: newRole });
                user.role = newRole;
                toast.success(`Rôle mis à jour`);
            } catch (e) {
                toast.error("Erreur role");
            }
        };

        const renderUserList = () => h('div', { class: "space-y-4" }, [
            h('div', { class: "flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-3xl border border-slate-100 dark:border-white/5" }, [
                h('span', { class: "material-icons-round opacity-40 ml-2" }, 'search'),
                h('input', {
                    value: searchQuery.value,
                    onInput: (e: any) => searchQuery.value = e.target.value,
                    placeholder: "Rechercher un étudiant (nom, phone)...",
                    class: "bg-transparent border-none text-sm w-full focus:ring-0 placeholder:opacity-40"
                })
            ]),
            h('div', { class: "grid gap-3" }, filteredUsers.value.map(user => h('div', {
                class: `flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-[32px] border transition-all ${user.status === 'banned' ? 'border-red-500/20 opacity-60' : 'border-slate-100 dark:border-white/5'}`
            }, [
                h('div', { class: "flex items-center gap-4" }, [
                    h('div', { class: "w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center" }, [
                        user.avatar ? h('img', { src: user.avatar, class: "w-full h-full object-cover" }) : h('span', { class: "material-icons-round opacity-20" }, 'person')
                    ]),
                    h('div', [
                        h('div', { class: "flex items-center gap-2" }, [
                            h('p', { class: "text-sm font-black" }, user.name),
                            user.role === 'admin' ? h('span', { class: "px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-full uppercase" }, "Admin") : null
                        ]),
                        h('p', { class: "text-[10px] opacity-40" }, `${user.phone} • ${user.faculty || 'Inconnu'}`)
                    ])
                ]),
                h('div', { class: "flex items-center gap-2" }, [
                    h('button', {
                        onClick: () => changeRole(user),
                        class: "w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center active:scale-90"
                    }, [h('span', { class: "material-icons-round text-sm" }, 'shield')]),
                    h('button', {
                        onClick: () => toggleUserStatus(user),
                        class: `w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 ${user.status === 'banned' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`
                    }, [h('span', { class: "material-icons-round text-sm" }, user.status === 'banned' ? 'check_circle' : 'block')])
                ])
            ])))
        ]);

        const renderStats = () => h('div', { class: "space-y-8" }, [
            h('div', { class: "grid grid-cols-1 sm:grid-cols-3 gap-6" }, [
                h('div', { class: "bg-white dark:bg-white/5 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl" }, [
                    h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" }, "Utilisateurs"),
                    h('p', { class: "text-4xl font-black tracking-tighter" }, stats.value.userCount || 0)
                ]),
                h('div', { class: "bg-white dark:bg-white/5 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl" }, [
                    h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" }, "Stories"),
                    h('p', { class: "text-4xl font-black tracking-tighter text-amber-500" }, stats.value.activeStories || 0)
                ]),
                h('div', { class: "bg-white dark:bg-white/5 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl" }, [
                    h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" }, "Posts"),
                    h('p', { class: "text-4xl font-black tracking-tighter text-primary" }, stats.value.postCount || 0)
                ])
            ]),
            h('div', { class: "grid grid-cols-2 gap-4" }, [
                h('button', {
                    onClick: () => currentView.value = 'users',
                    class: "p-8 bg-primary text-white rounded-[40px] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all text-center"
                }, "Gérer Étudiants"),
                h('button', {
                    onClick: () => currentView.value = 'moderation',
                    class: "p-8 bg-slate-900 dark:bg-white/10 text-white rounded-[40px] font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all text-center"
                }, "Modération")
            ])
        ]);

        const testMedia = async () => {
            try {
                toast.info("Demande d'accès média en cours...");
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                toast.success("Accès Caméra/Micro OK !");
                // On arrête tout de suite pour ne pas laisser la cam allumée
                stream.getTracks().forEach(track => track.stop());
            } catch (e) {
                console.error("Media error:", e);
                toast.error("Accès refusé ou non supporté par le navigateur.");
            }
        };

        const renderModeration = () => h('div', { class: "flex flex-col items-center justify-center p-12 text-center space-y-6" }, [
            h('div', { class: "w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4" }, [
                h('span', { class: "material-icons-round text-4xl" }, 'security')
            ]),
            h('h2', { class: "text-xl font-black" }, "Centre de Modération"),
            h('p', { class: "text-xs opacity-50 max-w-xs" }, "Utilisez ces outils pour maintenir l'intégrité du campus. Toute action est irréversible."),

            h('div', { class: "grid grid-cols-1 gap-4 w-full" }, [
                h('button', {
                    onClick: testMedia,
                    class: "p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 font-black uppercase text-[10px] tracking-widest flex items-center gap-4 active:scale-95 transition-all text-left"
                }, [
                    h('span', { class: "material-icons-round text-amber-500" }, 'videocam'),
                    h('div', [
                        h('p', { class: "text-amber-500" }, "Diagnostic Média"),
                        h('p', { class: "text-[8px] opacity-40 lowercase font-medium" }, "Vérifier les permissions caméra/micro")
                    ])
                ]),
                h('button', {
                    class: "p-6 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 font-black uppercase text-[10px] tracking-widest flex items-center gap-4 opacity-50 cursor-not-allowed"
                }, [
                    h('span', { class: "material-icons-round" }, 'auto_delete'),
                    h('p', [
                        h('span', "Nettoyage Auto"),
                        h('br'),
                        h('span', { class: "text-[8px] lowercase font-medium" }, "Supprimer posts signalés (bientôt)")
                    ])
                ])
            ])
        ]);

        return () => h('div', { class: "flex flex-col min-h-screen bg-[#f8fafc] dark:bg-[#0f1115] p-6 pb-24" }, [
            // Header
            h('header', { class: "flex items-center justify-between mb-8" }, [
                h('div', [
                    h('h1', { class: "text-3xl font-black tracking-tighter" },
                        currentView.value === 'stats' ? "Arène Admin" :
                            currentView.value === 'users' ? "Gestion Étudiants" : "Modération"
                    ),
                    h('p', { class: "text-xs font-bold opacity-40 mt-1 uppercase tracking-widest" }, "Flammes UP Headquarters")
                ]),
                currentView.value !== 'stats' ? h('button', {
                    onClick: () => currentView.value = 'stats',
                    class: "w-10 h-10 rounded-full bg-white dark:bg-white/5 shadow-sm flex items-center justify-center active:scale-90 transition-all font-black text-xl"
                }, [h('span', { class: "material-icons-round" }, 'close')]) : h('button', {
                    onClick: () => props.onBack?.(),
                    class: "w-10 h-10 rounded-full bg-white dark:bg-white/5 shadow-sm flex items-center justify-center active:scale-90 transition-all"
                }, [h('span', { class: "material-icons-round" }, 'arrow_back')])
            ]),

            isLoading.value ? h('div', { class: "flex-1 flex items-center justify-center p-20" }, [
                h('div', { class: "w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" })
            ]) : (
                currentView.value === 'stats' ? renderStats() :
                    currentView.value === 'users' ? renderUserList() :
                        renderModeration()
            )
        ]);
    }
});
