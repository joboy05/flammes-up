
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
import ChatBubbles, { ChatBubble } from './components/ChatBubbles';

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

      // Si déjà authentifié (token JWT valide), récupérer le profil depuis le backend
      if (isAuthenticated.value) {
        try {
          const data = await api.getMe();
          if (data.user) {
            currentUser.value = { ...currentUser.value, ...data.user };
            localStorage.setItem('up_profile', JSON.stringify(currentUser.value));
          }
          // Connecter WebSocket
          ws.connect();
        } catch (err) {
          // Token invalide/expiré, déconnecter
          console.warn('Token expiré, reconnexion nécessaire');
          api.logout();
          isAuthenticated.value = false;
        }
      }

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
          ws.connect();
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
          ws.connect();
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
          ws.connect();
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

      if (!currentUser.value.isProfileComplete) {
        return h(ProfileSetupView, {
          user: currentUser.value,
          onComplete: handleProfileComplete
        });
      }

      switch (activeTab.value) {
        case 'feed': return h(FeedView, { isEcoMode: isEcoMode.value, onOpenNotifications: () => activeTab.value = 'notifications' });
        case 'hub': return h(HubView, { onSelect: (t) => activeTab.value = t as any });
        case 'marketplace': return h(MarketplaceView, { isEcoMode: isEcoMode.value });
        case 'confessions': return h(ConfessionsView);
        case 'messages': return h(MessagesView, {
          onOpenChat: (id: string) => activeTab.value = 'chat_detail',
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
        case 'events': return h(EventsView, { onBack: () => activeTab.value = 'hub' });
        case 'resources': return h(ResourcesView, { onBack: () => activeTab.value = 'hub' });
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
              renderMainContent()
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
