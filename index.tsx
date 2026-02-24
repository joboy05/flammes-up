
import { createApp } from 'vue';
import App from './App';
import './index.css';

const app = createApp(App);
app.mount('#app');

// Hide preloader once app is mounted
const hidePreloader = () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('hidden');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }
};

// Hide after mount + short delay for rendering
setTimeout(hidePreloader, 300);

// Disable service workers (was causing caching issues)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}
