import { defineComponent, h, ref, onMounted } from 'vue';
import { api } from '../services/api';
import { toast } from '../services/toast';

export default defineComponent({
  name: 'HubView',
  emits: ['select'],
  setup(props, { emit }) {
    const primaryServices = ref<any[]>([]);
    const gridServices = ref<any[]>([]);
    const emergencyServices = ref<any[]>([]);
    const isLoading = ref(true);

    const loadConfig = async () => {
      try {
        const config = await api.getConfigServices();
        // Split services based on their IDs or types for Hub
        const allHub = config.hub || [];
        primaryServices.value = allHub.slice(0, 2);
        gridServices.value = allHub.slice(2);
        emergencyServices.value = (config.quickAccess || []).filter((s: any) => s.phone);
      } catch (e) {
        console.error("Hub load error:", e);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(loadConfig);

    const handleEmergency = (type: string, number: string) => {
      const confirm = window.confirm(`Voulez-vous appeler d'urgence ${type} ?`);
      if (confirm) {
        window.location.href = `tel:${number}`;
      }
    };

    const handleShare = async () => {
      const shareData = {
        title: 'Flammes UP - Parakou',
        text: 'Rejoins-moi sur le réseau social étudiant de l\'Université de Parakou ! 🔥',
        url: window.location.origin
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          toast.success("Lien de partage copié dans le presse-papier ! ✨");
        }
      } catch (err) {
        console.error("Partage échoué:", err);
      }
    };

    return () => h('div', { class: "flex flex-col min-h-full pb-10" }, [
      h('header', { class: "px-6 pt-12 pb-10 bg-gradient-to-br from-primary to-[#c41e1e] text-white rounded-b-[45px] shadow-2xl relative overflow-hidden" }, [
        h('div', { class: "absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" }),
        h('h1', { class: "text-3xl font-black mb-1 tracking-tight" }, 'Services UP'),
        h('p', { class: "opacity-80 text-xs font-bold uppercase tracking-widest" }, 'Parakou Digital Campus')
      ]),

      isLoading.value ? h('div', { class: "p-20 flex justify-center" }, [
        h('div', { class: "w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" })
      ]) :
        h('div', { class: "px-5 -mt-8 space-y-6 relative z-10" }, [
          h('div', { class: "space-y-3" },
            primaryServices.value.map(s => h('button', {
              onClick: () => emit('select', s.id),
              class: "w-full flex items-center gap-5 p-5 bg-white dark:bg-[#1a1d23] rounded-[30px] shadow-xl border border-black/5 dark:border-white/5 active:scale-[0.97] transition-all"
            }, [
              h('div', { class: `w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-white shadow-lg` }, [
                h('span', { class: "material-icons-round text-3xl" }, s.icon)
              ]),
              h('div', { class: "flex-1 text-left" }, [
                h('div', { class: "flex items-center gap-2" }, [
                  h('h3', { class: "font-black text-lg leading-tight" }, s.title),
                  (s as any).hot ? h('span', { class: "bg-red-500 text-[8px] font-black px-1.5 py-0.5 rounded text-white uppercase animate-pulse" }, 'HOT') : null,
                  s.new ? h('span', { class: "bg-blue-500 text-[8px] font-black px-1.5 py-0.5 rounded text-white uppercase" }, 'NOUVEAU') : null
                ]),
                h('p', { class: "text-xs opacity-60 font-medium" }, s.subtitle)
              ]),
              h('span', { class: "material-icons-round opacity-20" }, 'chevron_right')
            ]))
          ),

          h('div', { class: "grid grid-cols-2 gap-3" },
            gridServices.value.map(s => h('button', {
              onClick: () => emit('select', s.id),
              class: "bg-white dark:bg-[#1a1d23]/50 p-4 rounded-[28px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col items-start gap-3 active:scale-95 transition-all"
            }, [
              h('div', { class: `w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-white shadow-md` }, [
                h('span', { class: "material-icons-round text-xl" }, s.icon)
              ]),
              h('div', { class: "text-left" }, [
                h('h4', { class: "font-bold text-sm" }, s.title),
                h('p', { class: "text-[10px] opacity-50 font-medium" }, s.subtitle)
              ])
            ]))
          ),

          h('section', { class: "pt-4" }, [
            h('h3', { class: "text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 ml-2" }, 'Installation Native'),
            h('button', {
              onClick: () => window.open(window.location.origin + '/flammes-up.apk', '_blank'),
              class: "w-full bg-primary/10 border border-primary/20 p-5 rounded-[28px] flex items-center gap-4 active:scale-[0.98] transition-all"
            }, [
              h('div', { class: "w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg" }, [
                h('span', { class: "material-icons-round" }, 'android')
              ]),
              h('div', { class: "text-left" }, [
                h('p', { class: "font-black text-sm text-primary" }, "Télécharger l'APK"),
                h('p', { class: "text-[10px] opacity-60" }, "Version Android native pour Parakou")
              ]),
              h('span', { class: "material-icons-round ml-auto text-primary/30" }, 'download')
            ]),

            h('button', {
              onClick: handleShare,
              class: "w-full bg-primary/10 border border-primary/20 p-5 rounded-[28px] flex items-center gap-4 active:scale-[0.98] transition-all mt-3"
            }, [
              h('div', { class: "w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg" }, [
                h('span', { class: "material-icons-round" }, 'share')
              ]),
              h('div', { class: "text-left" }, [
                h('p', { class: "font-black text-sm text-primary" }, "Partager l'App"),
                h('p', { class: "text-[10px] opacity-60" }, "Invite tes amis sur le campus")
              ]),
              h('span', { class: "material-icons-round ml-auto text-primary/30" }, 'send')
            ])
          ]),

          emergencyServices.value.length > 0 ? h('section', { class: "pt-4" }, [
            h('h3', { class: "text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 ml-2" }, 'Urgences & Sécurité'),
            h('div', { class: "grid grid-cols-2 gap-3" },
              emergencyServices.value.map(s => h('button', {
                onClick: () => handleEmergency(s.name, s.phone),
                class: "bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-center gap-3 text-red-500 font-black text-xs active:scale-95 transition-all"
              }, [
                h('span', { class: "material-icons-round text-lg" }, s.icon), s.name
              ]))
            )
          ]) : null
        ])
    ]);
  }
});
