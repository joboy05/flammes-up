
import { createApp } from 'vue';
import App from './App';
import anime from 'animejs';
import './index.css';

const app = createApp(App);
app.mount('#app');

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

const initAnimePreloader = () => {
  // Animation du Squircle Logo (Le cadre rouge)
  (anime as any)({
    targets: '#logo-squircle',
    scale: [0.8, 1],
    opacity: [0, 1],
    rotate: '10deg',
    easing: 'easeOutElastic(1, .6)',
    duration: 1500
  });

  // Animation de la Flamme Blanche
  (anime as any)({
    targets: '#logo-flame',
    translateY: [10, 0],
    scale: [0.9, 1.1],
    easing: 'easeInOutQuad',
    duration: 1000,
    direction: 'alternate',
    loop: true
  });

  const statusEl = document.getElementById('loader-status');
  const statuses = ["Récupération des secrets...", "Chauffage du marché...", "Synchronisation des bus...", "Prêt pour Parakou !"];
  let statusIndex = 0;
  setInterval(() => {
    if (statusEl) {
      statusEl.style.opacity = '0';
      setTimeout(() => {
        statusIndex = (statusIndex + 1) % statuses.length;
        statusEl.textContent = statuses[statusIndex];
        statusEl.style.opacity = '1';
      }, 300);
    }
  }, 1200);
};

initAnimePreloader();

// Hide Preloader once app is ready
setTimeout(() => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    (anime as any)({
      targets: preloader,
      opacity: [1, 0],
      easing: 'easeInOutQuad',
      duration: 800,
      complete: () => {
        preloader.style.display = 'none';
      }
    });
  }
}, 2500);
