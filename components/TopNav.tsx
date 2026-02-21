import { defineComponent, h, ref } from 'vue';

export default defineComponent({
  name: 'TopNav',
  props: {
    isDarkMode: Boolean,
    userAvatar: String,
    hasStory: Boolean
  },
  emits: ['openDrawer', 'openNotifications', 'openProfile', 'toggleTheme', 'goHome'],
  setup(props, { emit }) {
    const defaultAvatar = 'assets/default-avatar.svg';
    const isInstallAvailable = ref(false);

    window.addEventListener('pwa-available', () => {
      isInstallAvailable.value = true;
    });

    return () => h('header', {
      class: "sticky top-0 z-[60] bg-white/95 dark:bg-[#0f1115] ios-blur border-b border-white/5 px-4 py-4 flex items-center justify-between shadow-lg transition-colors duration-500"
    }, [
      h('div', { class: "flex items-center gap-4" }, [
        h('button', {
          onClick: () => emit('openDrawer'),
          class: "w-10 h-10 flex items-center justify-center text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl active:scale-90 transition-all"
        }, [
          h('span', { class: "material-icons-round text-2xl" }, 'menu')
        ]),
        h('div', {
          onClick: () => emit('goHome'),
          class: "flex items-center gap-3 cursor-pointer group"
        }, [
          h('div', { class: "w-10 h-10 bg-primary rounded-[14px] flex items-center justify-center shadow-xl shadow-primary/20 group-active:scale-95 transition-all overflow-hidden" }, [
            h('img', { src: 'assets/logo.svg', class: "w-full h-full object-cover scale-150" })
          ]),
          h('div', { class: "flex flex-col -space-y-1" }, [
            h('h1', { class: "text-lg font-black text-slate-900 dark:text-white tracking-tighter" }, 'FLAMMES UP'),
            h('span', { class: "text-[8px] font-black text-primary uppercase tracking-[0.3em] opacity-80" }, 'Parakou')
          ])
        ])
      ]),

      h('div', { class: "flex items-center gap-1.5 sm:gap-3" }, [
        isInstallAvailable.value ? h('button', {
          onClick: () => window.dispatchEvent(new CustomEvent('trigger-pwa-install')),
          class: "w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse active:scale-90 transition-all"
        }, [
          h('span', { class: "material-icons-round text-xl" }, 'download_for_offline')
        ]) : null,

        h('button', {
          onClick: () => emit('toggleTheme'),
          class: "w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-600 dark:text-white/60 active:scale-90 transition-all"
        }, [
          h('span', { class: "material-icons-round text-xl" }, props.isDarkMode ? 'light_mode' : 'dark_mode')
        ]),

        h('button', {
          onClick: () => emit('openNotifications'),
          class: "w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-600 dark:text-white/60 relative active:scale-90 transition-all"
        }, [
          h('span', { class: "material-icons-round text-xl" }, 'notifications'),
          h('span', { class: "absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-[#0f1115]" })
        ]),

        h('button', {
          onClick: () => emit('openProfile'),
          class: "relative ml-1 active:scale-95 transition-all"
        }, [
          h('div', { class: `w-10 h-10 rounded-full p-[2px] ${props.hasStory ? 'bg-gradient-to-tr from-primary to-orange-500' : 'bg-slate-200 dark:bg-white/10'}` }, [
            h('div', { class: "w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-[#0f1115] bg-slate-100" }, [
              h('img', {
                src: props.userAvatar || defaultAvatar,
                class: "w-full h-full object-cover"
              })
            ])
          ])
        ])
      ])
    ]);
  }
});