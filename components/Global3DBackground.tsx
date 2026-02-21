
import { defineComponent, onMounted, onUnmounted, ref, h, watch } from 'vue';
import * as THREE from 'three';

export default defineComponent({
  name: 'Global3DBackground',
  setup() {
    const containerRef = ref<HTMLElement | null>(null);
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let particles: THREE.Points;
    let stars: THREE.Points;
    let mat1: THREE.PointsMaterial;
    let mat2: THREE.PointsMaterial;

    const updateParticlesForTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (mat1) mat1.opacity = isDark ? 0.3 : 0.15;
      if (mat2) mat2.opacity = isDark ? 0.5 : 0.2;
    };

    onMounted(() => {
      if (!containerRef.value) return;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.value.appendChild(renderer.domElement);

      // Deep Red Nebula Dust
      const geo1 = new THREE.BufferGeometry();
      const pos1 = new Float32Array(3000 * 3);
      for (let i = 0; i < 3000 * 3; i++) pos1[i] = (Math.random() - 0.5) * 18;
      geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3));
      
      mat1 = new THREE.PointsMaterial({
        color: 0xee2b2b,
        size: 0.04,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      particles = new THREE.Points(geo1, mat1);
      scene.add(particles);

      // Distant White Stars
      const geo2 = new THREE.BufferGeometry();
      const pos2 = new Float32Array(1500 * 3);
      for (let i = 0; i < 1500 * 3; i++) pos2[i] = (Math.random() - 0.5) * 25;
      geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));

      mat2 = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true,
        opacity: 0.5
      });
      stars = new THREE.Points(geo2, mat2);
      scene.add(stars);

      updateParticlesForTheme();

      const animate = () => {
        const time = Date.now() * 0.0002;
        particles.rotation.y += 0.0005;
        stars.rotation.y -= 0.0002;
        particles.position.y = Math.sin(time) * 0.2;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();

      const observer = new MutationObserver(() => updateParticlesForTheme());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    });

    onUnmounted(() => renderer?.dispose());

    return () => h('div', { 
      ref: containerRef, 
      class: "fixed inset-0 -z-50 pointer-events-none transition-opacity duration-1000" 
    });
  }
});