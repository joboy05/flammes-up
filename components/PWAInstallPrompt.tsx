
import { defineComponent, ref, onMounted, h, Transition } from 'vue';

export default defineComponent({
  name: 'PWAInstallPrompt',
  setup() {
    const showPrompt = ref(false);
    const deferredPrompt = ref<any>(null);

    onMounted(() => {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt.value = e;
        // Update UI notify the user they can add to home screen
        showPrompt.value = true;
      });

      window.addEventListener('appinstalled', (evt) => {
        showPrompt.value = false;
        deferredPrompt.value = null;
        console.log('Flammes UP was installed');
      });

      // Global trigger for manual install button
      window.addEventListener('trigger-pwa-install', () => {
        if (deferredPrompt.value) {
          showPrompt.value = true;
          installPWA();
        } else {
          alert("L'application est déjà installée ou votre navigateur ne supporte pas l'installation directe.");
        }
      });
    });

    const installPWA = async () => {
      if (!deferredPrompt.value) return;

      // Show the prompt
      deferredPrompt.value.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.value.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);

      // We've used the prompt, and can't use it again, throw it away
      deferredPrompt.value = null;
      showPrompt.value = false;
    };

    return () => h(Transition, {
      enterActiveClass: "transition duration-500 ease-out",
      enterFromClass: "transform translate-y-full opacity-0",
      enterToClass: "transform translate-y-0 opacity-100",
      leaveActiveClass: "transition duration-300 ease-in",
      leaveFromClass: "transform translate-y-0 opacity-100",
      leaveToClass: "transform translate-y-full opacity-0"
    }, {
      default: () => showPrompt.value ? h('div', {
        class: "fixed bottom-24 left-4 right-4 z-[200] md:left-auto md:right-8 md:bottom-8 md:w-80"
      }, [
        h('div', {
          class: "bg-white dark:bg-[#1c1f26] rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-primary/10 flex flex-col items-center text-center gap-4"
        }, [
          h('div', {
            class: "w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20"
          }, [
            h('span', { class: "material-icons-round text-white text-3xl" }, 'add_to_home_screen')
          ]),
          h('div', [
            h('h3', { class: "font-black text-lg leading-tight" }, "Installer Flammes UP"),
            h('p', { class: "text-xs text-slate-500 mt-1" }, "Ajoute l'app sur ton écran d'accueil pour un accès ultra-rapide au campus.")
          ]),
          h('div', { class: "flex gap-3 w-full" }, [
            h('button', {
              onClick: () => showPrompt.value = false,
              class: "flex-1 px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 bg-slate-100 dark:bg-white/5 active:scale-95 transition-all"
            }, "Plus tard"),
            h('button', {
              onClick: installPWA,
              class: "flex-[2] px-4 py-3 rounded-2xl text-xs font-black text-white bg-primary shadow-lg shadow-primary/20 active:scale-95 transition-all"
            }, "Installer")
          ])
        ])
      ]) : null
    });
  }
});
