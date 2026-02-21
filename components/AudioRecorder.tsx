import { defineComponent, ref, h, onUnmounted } from 'vue';

export default defineComponent({
  name: 'AudioRecorder',
  emits: ['recorded'],
  setup(props, { emit }) {
    const isRecording = ref(false);
    const mediaRecorder = ref<MediaRecorder | null>(null);
    const audioChunks = ref<Blob[]>([]);
    const duration = ref(0);
    const timerInterval = ref<any>(null);

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.value = new MediaRecorder(stream);
        audioChunks.value = [];

        mediaRecorder.value.ondataavailable = (event) => {
          audioChunks.value.push(event.data);
        };

        mediaRecorder.value.onstop = async () => {
          const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            emit('recorded', {
              data: reader.result,
              duration: `${Math.floor(duration.value / 60)}:${(duration.value % 60).toString().padStart(2, '0')}`
            });
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.value.start();
        isRecording.value = true;
        duration.value = 0;
        timerInterval.value = setInterval(() => {
          duration.value++;
        }, 1000);
      } catch (err) {
        console.error("Erreur micro:", err);
        alert("Accès micro refusé ou non supporté.");
      }
    };

    const stopRecording = () => {
      if (mediaRecorder.value && isRecording.value) {
        mediaRecorder.value.stop();
        isRecording.value = false;
        clearInterval(timerInterval.value);
      }
    };

    onUnmounted(() => {
      if (timerInterval.value) clearInterval(timerInterval.value);
    });

    return () => h('div', { class: "flex flex-col items-center gap-4 p-6 bg-primary/5 rounded-[32px] border border-primary/10" }, [
      h('div', { class: "flex items-center gap-4" }, [
        isRecording.value ? h('div', { class: "flex items-center gap-2" }, [
          h('div', { class: "w-3 h-3 bg-primary rounded-full animate-ping" }),
          h('span', { class: "text-lg font-black font-mono" }, 
            `${Math.floor(duration.value / 60)}:${(duration.value % 60).toString().padStart(2, '0')}`
          )
        ]) : h('p', { class: "text-xs font-bold opacity-50 uppercase tracking-widest" }, "Appuie pour enregistrer")
      ]),
      
      h('button', {
        onMousedown: startRecording,
        onMouseup: stopRecording,
        onTouchstart: startRecording,
        onTouchend: stopRecording,
        class: `w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording.value ? 'bg-primary scale-110 shadow-[0_0_40px_rgba(238,43,43,0.5)]' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`
      }, [
        h('span', { class: "material-icons-round text-4xl text-white" }, isRecording.value ? 'mic' : 'mic_none')
      ]),

      h('p', { class: "text-[10px] font-black uppercase tracking-widest text-primary opacity-60" }, 
        isRecording.value ? "Relâche pour terminer" : "Maintenir pour parler"
      )
    ]);
  }
});