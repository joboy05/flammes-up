
import { defineComponent, ref, onMounted, h, watch } from 'vue';
import anime from 'animejs';
import TopNav from './components/TopNav';
import TabBar from './components/TabBar';
import DesktopSidebar from './components/DesktopSidebar';
import RightPanel from './components/RightPanel';
import Global3DBackground from './components/Global3DBackground';
import Drawer from './components/Drawer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ToastContainer from './components/ToastContainer';
import FeedView from './views/FeedView';
import MarketplaceView from './views/MarketplaceView';
import ConfessionsView from './views/ConfessionsView';
import ProfileView from './views/ProfileView';
import EditProfileView from './views/EditProfileView';
import NotificationsView from './views/NotificationsView';
import MessagesView from './views/MessagesView';
import HubView from './views/HubView';
import TransportView from './views/TransportView';
import EventsView from './views/EventsView';
import ResourcesView from './views/ResourcesView';
import AuthView from './views/AuthView';
import PublicFeedView from './views/PublicFeedView';
import LegalView from './views/LegalView';
import ChatDetailView from './views/ChatDetailView';
import ProfileSetupView from './views/ProfileSetupView';
import AssistantView from './views/AssistantView';
import MissionsView from './views/MissionsView';
import AlertsView from './views/AlertsView';
import RestoWaitView from './views/RestoWaitView';
import SecretCrushView from './views/SecretCrushView';
import FaceMatchView from './views/FaceMatchView';
import AdminDashboardView from './views/AdminDashboardView';
import LeaderboardView from './views/LeaderboardView';
import DiscoveryView from './views/DiscoveryView';
import FriendsView from './views/FriendsView';
import PublicProfileView from './views/PublicProfileView';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import ChatBubbles, { ChatBubble } from './components/ChatBubbles';
import { Motion } from '@motionone/vue';

import { api } from './services/api';
import { ws } from './services/socket';
import { toast } from './services/toast';

export default defineComponent({
  name: 'App',
  setup() {
    const activeTab = ref('feed');
    const isAuthenticated = ref(api.isLoggedIn());
    const isDarkMode = ref(true);
    const isEcoMode = ref(false);
    const activeBubbles = ref<ChatBubble[]>([]);
    const isDrawerOpen = ref(false);

    const savedProfile = localStorage.getItem('up_profile');
    let initialUser = {
      name: 'Étudiant UP',
      phone: '',
      faculty: '',
      level: '',
      residence: 'externe',
      maritalStatus: 'non_defini',
      avatar: '',
      bio: '',
      vibesReceived: 0,
      upPoints: 0,
      hasStory: false,
      isProfileComplete: false,
      role: 'user'
    };

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && typeof parsed === 'object') {
          initialUser = { ...initialUser, ...parsed };
        }
      } catch (e) {
        localStorage.removeItem('up_profile');
      }
    }
    const currentUser = ref(initialUser);

    watch(currentUser, (newVal) => {
      localStorage.setItem('up_profile', JSON.stringify(newVal));
    }, { deep: true });

    const hidePreloader = () => {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.pointerEvents = 'none';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }
    };

    onMounted(async () => {
      document.documentElement.classList.add('dark');

      window.addEventListener('nav', (e: any) => {
        activeTab.value = (e as any).detail;
      });

      window.addEventListener('nav-profile', (e: any) => {
        (window as any)._targetProfilePhone = (e as any).detail;
        activeTab.value = 'public_profile';
      });

      // Si déjà authentifié (token JWT valide), récupérer le profil depuis le backend
      if (isAuthenticated.value) {
        try {
          const data = await api.getMe();
          if (data.user) {
            currentUser.value = { ...currentUser.value, ...data.user };
            localStorage.setItem('up_profile', JSON.stringify(currentUser.value));
          }
          // Connecter WebSocket et sa room globale personnelle
          await ws.connect();
          if (currentUser.value.phone) {
            ws.joinUser(currentUser.value.phone);
          }
        } catch (err) {
          // Token invalide/expiré, déconnecter
          console.warn('Token expiré, reconnexion nécessaire');
          api.logout();
          isAuthenticated.value = false;
        }
      }

      // Push Notifications Setup
      const setupPush = async () => {
        const info = await Device.getInfo();

        // --- WEB NOTIFICATIONS ---
        if (info.platform === 'web') {
          if ('Notification' in window && Notification.permission === 'default') {
            // Ne pas spammer immédiatement, attendre 5 secondes
            setTimeout(async () => {
              if (confirm("Voulez-vous activer les notifications pour recevoir les nouvelles confessions et les messages ? 🔥")) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                  toast.success("Notifications activées ! 🔔");
                }
              }
            }, 5000);
          }
          return;
        }

        // --- NATIVE NOTIFICATIONS (ANDROID/IOS) ---
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive !== 'granted') return;

        await PushNotifications.register();

        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          // Enregistrer le token au backend si nécessaire
          if (currentUser.value.phone) {
            api.updateProfile({ pushToken: token.value }).catch(console.error);
          }
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          toast.info(notification.body || 'Nouvelle notification');
        });
      };

      ws.on('new-message', (data: any) => {
        // Viber si possible
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);

        // Si on n'est pas déjà dans la conversation, afficher un toast
        const activeId = (window as any)._activeConvId;
        if (activeId !== data.convId) {
          toast.info(`Nouveau message de ${data.message.from}`);
        }
      });

      setupPush();

      // Force hide preloader after mount
      hidePreloader();
    });

    const handleLogin = async (data: { phone: string; password: string }) => {
      try {
        const result = await api.login(data.phone, data.password);
        if (result.user) {
          currentUser.value = { ...currentUser.value, ...result.user };
          isAuthenticated.value = true;
          localStorage.setItem('up_auth', 'true');
          localStorage.setItem('up_profile', JSON.stringify(currentUser.value));
          await ws.connect();
          if (currentUser.value.phone) ws.joinUser(currentUser.value.phone);
          activeTab.value = currentUser.value.isProfileComplete ? 'feed' : 'feed';
        }
      } catch (err: any) {
        toast.error(err.message || 'Erreur de connexion');
      }
    };

    const handleRegister = async (data: any) => {
      try {
        const result = await api.register({
          phone: data.phone,
          password: data.password,
          name: data.name,
          faculty: data.faculty,
          level: data.level
        });
        if (result.user) {
          currentUser.value = { ...currentUser.value, ...result.user };
          isAuthenticated.value = true;
          localStorage.setItem('up_auth', 'true');
          localStorage.setItem('up_profile', JSON.stringify(currentUser.value));
          await ws.connect();
          if (currentUser.value.phone) ws.joinUser(currentUser.value.phone);
          activeTab.value = 'feed';
        }
      } catch (err: any) {
        toast.error(err.message || 'Erreur d\'inscription');
      }
    };

    const handleGoogleLogin = async (idToken: string) => {
      try {
        const result = await api.googleLogin(idToken);
        if (result.user) {
          currentUser.value = { ...currentUser.value, ...result.user };
          isAuthenticated.value = true;
          localStorage.setItem('up_auth', 'true');
          localStorage.setItem('up_profile', JSON.stringify(currentUser.value));
          await ws.connect();
          if (currentUser.value.phone) ws.joinUser(currentUser.value.phone);
          activeTab.value = currentUser.value.isProfileComplete ? 'feed' : 'feed';
        }
      } catch (err: any) {
        toast.error(err.message || 'Erreur de connexion Google');
      }
    };

    const handleProfileComplete = async (extraData: any) => {
      try {
        const result = await api.updateProfile({ ...extraData, isProfileComplete: true });
        if (result.user) {
          currentUser.value = { ...currentUser.value, ...result.user };
          localStorage.setItem('up_profile', JSON.stringify(currentUser.value));
        }
        activeTab.value = 'feed';
      } catch (err: any) {
        toast.error(err.message || 'Erreur lors de la finalisation');
      }
    };

    const handleLogout = () => {
      if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
        api.logout();
        ws.disconnect();
        isAuthenticated.value = false;
        currentUser.value = { ...initialUser };
        activeTab.value = 'feed';
        toast.info('Déconnecté');
      }
    };

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
      if (isDarkMode.value) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };

    const fullScreenViews = ['auth', 'facematch', 'chat_detail', 'assistant', 'crush', 'legal', 'discovery'];

    const renderMainContent = () => {
      if (!isAuthenticated.value) {
        if (activeTab.value === 'auth') return h(AuthView, {
          onLogin: handleLogin,
          onRegister: handleRegister,
          onGoogleLogin: handleGoogleLogin,
          onBack: () => activeTab.value = 'feed'
        });
        return h(PublicFeedView, { onJoin: () => activeTab.value = 'auth' });
      }

      if (!currentUser.value.isProfileComplete && activeTab.value !== 'feed') {
        return h(ProfileSetupView, {
          user: currentUser.value,
          onComplete: handleProfileComplete,
          onSkip: () => activeTab.value = 'feed'
        });
      }

      switch (activeTab.value) {
        case 'feed': return h(FeedView, { isEcoMode: isEcoMode.value, onOpenNotifications: () => activeTab.value = 'notifications' });
        case 'hub': return h(HubView, { onSelect: (t) => activeTab.value = t as any });
        case 'marketplace': return h(MarketplaceView, { isEcoMode: isEcoMode.value });
        case 'confessions': return h(ConfessionsView);
        case 'messages': return h(MessagesView, {
          onOpenChat: (id: string) => {
            (window as any)._activeConvId = id;
            activeTab.value = 'chat_detail';
          },
          onOpenDiscovery: () => activeTab.value = 'discovery'
        });
        case 'facematch': return h(FaceMatchView, { onBack: () => activeTab.value = 'feed', userVibes: currentUser.value.vibesReceived });
        case 'profile': return h(ProfileView, {
          user: currentUser.value,
          isDarkMode: isDarkMode.value,
          onEdit: () => activeTab.value = 'edit_profile',
          onLogout: handleLogout
        });
        case 'edit_profile': return h(EditProfileView, {
          user: currentUser.value,
          onBack: () => activeTab.value = 'profile',
          onSave: (newData) => { currentUser.value = { ...currentUser.value, ...newData }; activeTab.value = 'profile'; }
        });
        case 'assistant': return h(AssistantView, { onBack: () => activeTab.value = 'hub' });
        case 'transport': return h(TransportView, { onBack: () => activeTab.value = 'hub' });
        case 'alerts': return h(AlertsView, { onBack: () => activeTab.value = 'hub' });
        case 'chat_detail': return h(ChatDetailView, { onBack: () => activeTab.value = 'messages' });
        case 'notifications': return h(NotificationsView, {
          onBack: () => activeTab.value = 'feed',
          onNavigate: (target: string) => activeTab.value = target as any
        });
        case 'admin_dashboard': return h(AdminDashboardView, { onBack: () => activeTab.value = 'hub' });
        case 'missions': return h(MissionsView, { onBack: () => activeTab.value = 'hub' });
        case 'resto': return h(RestoWaitView, { onBack: () => activeTab.value = 'hub' });
        case 'crush': return h(SecretCrushView, { onBack: () => activeTab.value = 'hub' });
        case 'legal': return h(LegalView, { onBack: () => activeTab.value = 'profile' });
        case 'discovery': return h(DiscoveryView, {
          onBack: () => activeTab.value = 'hub',
          onStartChat: (phone: string, name: string, avatar: string) => {
            const myId = currentUser.value.phone;
            const otherId = phone;
            const convId = [myId, otherId].sort().join('-');
            activeTab.value = 'chat_detail';
            (window as any)._activeConvId = convId;

            if (!activeBubbles.value.find(b => b.id === convId)) {
              activeBubbles.value.push({
                id: convId,
                name: name || 'Contact',
                avatar: avatar || ''
              });
            }
          }
        });
        case 'leaderboard': return h(LeaderboardView, { onBack: () => activeTab.value = 'hub' });
        case 'friends': return h(FriendsView, { onBack: () => activeTab.value = 'hub', onNavigate: (t, p) => { activeTab.value = t as any; if (p) (window as any)._activeConvId = p.friend; } });
        case 'events': return h(EventsView, { onBack: () => activeTab.value = 'hub' });
        case 'resources': return h(ResourcesView, { onBack: () => activeTab.value = 'hub' });
        case 'public_profile': return h(PublicProfileView, {
          phone: (window as any)._targetProfilePhone,
          onBack: () => activeTab.value = 'feed', // Or history.back? Feed is safer
          onStartChat: (phone: string, name: string, avatar: string) => {
            const myId = currentUser.value.phone;
            const otherId = phone;
            const convId = [myId, otherId].sort().join('-');
            activeTab.value = 'chat_detail';
            (window as any)._activeConvId = convId;

            if (!activeBubbles.value.find(b => b.id === convId)) {
              activeBubbles.value.push({
                id: convId,
                name: name || 'Contact',
                avatar: avatar || ''
              });
            }
          }
        });
        default: return h(FeedView, { isEcoMode: isEcoMode.value });
      }
    };

    return () => h('div', {
      class: ["flex flex-col h-screen font-display transition-colors duration-500 bg-white dark:bg-[#0f1115] text-slate-900 dark:text-white overflow-hidden"]
    }, [
      h(Global3DBackground),

      // Toast notifications
      h(ToastContainer),

      isAuthenticated.value && !fullScreenViews.includes(activeTab.value) ? h(TopNav, {
        isDarkMode: isDarkMode.value,
        userAvatar: currentUser.value.avatar,
        hasStory: currentUser.value.hasStory,
        onOpenDrawer: () => isDrawerOpen.value = true,
        onOpenNotifications: () => activeTab.value = 'notifications',
        onOpenProfile: () => activeTab.value = 'profile',
        onToggleTheme: toggleTheme,
        onGoHome: () => activeTab.value = 'feed'
      }) : null,

      h('div', { class: "flex flex-1 overflow-hidden relative" }, [
        isAuthenticated.value && !fullScreenViews.includes(activeTab.value) ? h(DesktopSidebar, {
          activeTab: activeTab.value,
          onUpdateActiveTab: (t) => activeTab.value = t
        }) : null,

        h('main', { class: "flex-1 relative overflow-hidden flex flex-col" }, [
          h('div', {
            class: [
              "flex-1 overflow-y-auto no-scrollbar",
              isAuthenticated.value && !fullScreenViews.includes(activeTab.value) ? "pb-24" : ""
            ]
          }, [
            h('div', { class: isAuthenticated.value ? "max-w-3xl mx-auto h-full" : "h-full" }, [
              h(Motion, {
                key: activeTab.value,
                initial: { opacity: 0, y: 10, scale: 0.98 },
                animate: { opacity: 1, y: 0, scale: 1 },
                transition: { duration: 0.4, easing: [0.22, 1, 0.36, 1] },
                class: "h-full"
              }, { default: () => renderMainContent() })
            ])
          ]),

          isAuthenticated.value && !fullScreenViews.includes(activeTab.value) ? h(TabBar, {
            activeTab: activeTab.value,
            onUpdateActiveTab: (t) => activeTab.value = t
          }) : null
        ]),

        isAuthenticated.value && !fullScreenViews.includes(activeTab.value) ? h(RightPanel) : null
      ]),

      isAuthenticated.value ? h(Drawer, {
        isOpen: isDrawerOpen.value,
        userRole: currentUser.value.role,
        onClose: () => isDrawerOpen.value = false,
        onSelect: (t: any) => {
          if (t === 'install') {
            window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
          } else {
            activeTab.value = t;
          }
          isDrawerOpen.value = false;
        }
      }) : null,

      h(PWAInstallPrompt),

      // Global Chat Bubbles
      h(ChatBubbles, {
        bubbles: activeBubbles.value,
        onOpen: (id: string) => {
          activeTab.value = 'chat_detail';
          (window as any)._activeConvId = id;
        },
        onClose: (id: string) => {
          activeBubbles.value = activeBubbles.value.filter(b => b.id !== id);
        }
      })
    ]);
  }
});
