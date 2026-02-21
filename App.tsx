
import { defineComponent, ref, onMounted, h, watch } from 'vue';
import TopNav from './components/TopNav';
import TabBar from './components/TabBar';
import DesktopSidebar from './components/DesktopSidebar';
import RightPanel from './components/RightPanel';
import Global3DBackground from './components/Global3DBackground';
import Drawer from './components/Drawer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FeedView from './views/FeedView';
// ... rest of imports
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
import AssistantView from './views/AssistantView';
import MissionsView from './views/MissionsView';
import AlertsView from './views/AlertsView';
import RestoWaitView from './views/RestoWaitView';
import SecretCrushView from './views/SecretCrushView';
import FaceMatchView from './views/FaceMatchView';
import LeaderboardView from './views/LeaderboardView';

export default defineComponent({
  name: 'App',
  setup() {
    const activeTab = ref('feed');
    const isAuthenticated = ref(localStorage.getItem('up_auth') === 'true');
    const isDarkMode = ref(true);
    const isEcoMode = ref(false);
    const isDrawerOpen = ref(false);

    const savedProfile = localStorage.getItem('up_profile');
    const currentUser = ref(savedProfile ? JSON.parse(savedProfile) : {
      name: 'Moussa Bakary',
      phone: '0197000000',
      faculty: 'FLASH (Lettres & Arts)',
      level: 'Licence 2',
      isResident: true,
      maritalStatus: 'celibataire',
      avatar: '',
      bio: 'Étudiant passionné par la tech et le campus de Parakou.',
      vibesReceived: 42,
      hasStory: true
    });

    watch(currentUser, (newVal) => {
      localStorage.setItem('up_profile', JSON.stringify(newVal));
    }, { deep: true });

    onMounted(() => {
      document.documentElement.classList.add('dark');
      window.addEventListener('nav', (e: any) => activeTab.value = e.detail);

      setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
          preloader.style.opacity = '0';
          setTimeout(() => preloader.style.visibility = 'hidden', 500);
        }
      }, 1500);
    });

    const handleLogin = (phone: string) => {
      currentUser.value.phone = phone;
      isAuthenticated.value = true;
      localStorage.setItem('up_auth', 'true');
      activeTab.value = 'feed';
    };

    const handleLogout = () => {
      isAuthenticated.value = false;
      localStorage.setItem('up_auth', 'false');
      activeTab.value = 'feed';
    };

    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value;
      if (isDarkMode.value) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };

    // Vues plein écran (Sans Navbar ni Tabbar)
    const fullScreenViews = ['auth', 'facematch', 'chat_detail', 'assistant', 'crush', 'legal'];

    const renderMainContent = () => {
      if (!isAuthenticated.value) {
        if (activeTab.value === 'auth') return h(AuthView, { onLogin: handleLogin, onBack: () => activeTab.value = 'feed' });
        return h(PublicFeedView, { onJoin: () => activeTab.value = 'auth' });
      }

      switch (activeTab.value) {
        case 'feed': return h(FeedView, { isEcoMode: isEcoMode.value, onOpenNotifications: () => activeTab.value = 'notifications' });
        case 'hub': return h(HubView, { onSelect: (t) => activeTab.value = t as any });
        case 'marketplace': return h(MarketplaceView, { isEcoMode: isEcoMode.value });
        case 'confessions': return h(ConfessionsView);
        case 'messages': return h(MessagesView, { onOpenChat: (id: string) => activeTab.value = 'chat_detail' });
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
        case 'missions': return h(MissionsView, { onBack: () => activeTab.value = 'hub' });
        case 'resto': return h(RestoWaitView, { onBack: () => activeTab.value = 'hub' });
        case 'crush': return h(SecretCrushView, { onBack: () => activeTab.value = 'hub' });
        case 'legal': return h(LegalView, { onBack: () => activeTab.value = 'profile' });
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
        onClose: () => isDrawerOpen.value = false,
        onSelect: (t) => {
          if (t === 'install') {
            window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
          } else {
            activeTab.value = t;
          }
          isDrawerOpen.value = false;
        }
      }) : null,

      h(PWAInstallPrompt)
    ]);
  }
});
