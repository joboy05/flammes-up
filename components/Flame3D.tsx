
import { defineComponent, onMounted, onUnmounted, ref, h } from 'vue';
import * as THREE from 'three';

export default defineComponent({
  name: 'Flame3D',
  props: {
    size: { type: Number, default: 350 }
  },
  setup(props) {
    const containerRef = ref<HTMLElement | null>(null);
    let renderer: THREE.WebGLRenderer;
    let clock: THREE.Clock;

    onMounted(() => {
      if (!containerRef.value) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 4;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(props.size, props.size);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.value.appendChild(renderer.domElement);

      clock = new THREE.Clock();

      // --- Style Original : Le Cristal Incandescent ---
      const geometry = new THREE.IcosahedronGeometry(1, 12);
      const material = new THREE.MeshStandardMaterial({
        color: 0xee2b2b,
        emissive: 0xff0000,
        emissiveIntensity: 3,
        wireframe: true,
        transparent: true,
        opacity: 0.7
      });

      const crystal = new THREE.Mesh(geometry, material);
      scene.add(crystal);

      // Braises
      const particleCount = 150;
      const emberGeo = new THREE.BufferGeometry();
      const emberPos = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        emberPos[i * 3] = (Math.random() - 0.5) * 2;
        emberPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
        emberPos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }
      emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
      const emberMat = new THREE.PointsMaterial({
        color: 0xff3300,
        size: 0.04,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const embers = new THREE.Points(emberGeo, emberMat);
      scene.add(embers);

      // Glow Aura
      const auraGeo = new THREE.SphereGeometry(1.1, 32, 32);
      const auraMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.1, side: THREE.BackSide });
      scene.add(new THREE.Mesh(auraGeo, auraMat));

      const pLight = new THREE.PointLight(0xff0000, 20, 10);
      pLight.position.set(0, 0, 2);
      scene.add(pLight);

      const animate = () => {
        const t = clock.getElapsedTime();
        
        // Morphisme léger du cristal
        const pos = geometry.attributes.position;
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          const noise = Math.sin(v.y * 3 + t * 4) * 0.15;
          v.normalize().multiplyScalar(1 + noise);
          pos.setXYZ(i, v.x, v.y, v.z);
        }
        pos.needsUpdate = true;
        crystal.rotation.y = t * 0.2;
        crystal.rotation.x = t * 0.1;

        // Animation des braises
        const ePos = emberGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          ePos[i * 3 + 1] += 0.015;
          if (ePos[i * 3 + 1] > 2.5) ePos[i * 3 + 1] = -2;
        }
        emberGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();
    });

    onUnmounted(() => renderer?.dispose());

    return () => h('div', { 
      ref: containerRef, 
      class: "flex items-center justify-center filter drop-shadow-[0_0_50px_rgba(238,43,43,0.7)]" 
    });
  }
});
