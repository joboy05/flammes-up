
import { defineComponent, ref, h } from 'vue';
import { UserProfile } from '../types';

export default defineComponent({
    name: 'ProfileSetupView',
    props: { user: { type: Object as () => UserProfile, required: true } },
    emits: ['complete'],
    setup(props, { emit }) {
        const bio = ref(props.user.bio || '');
        const maritalStatus = ref(props.user.maritalStatus === 'non_defini' ? 'celibataire' : props.user.maritalStatus);
        const residence = ref(props.user.residence || 'externe');

        const residences = [
            'externe',
            'BADEA-A',
            'BADEA-B',
            'Mohamed-VI',
            'Batiment B',
            'Batiment C',
            'Batiment D',
            'Batiment E'
        ];

        const handleSubmit = () => {
            emit('complete', {
                bio: bio.value,
                maritalStatus: maritalStatus.value,
                residence: residence.value,
                isProfileComplete: true
            });
        };

        return () => h('div', { class: "fixed inset-0 z-[200] bg-white dark:bg-[#0f1115] flex flex-col p-8 overflow-y-auto" }, [
            h('div', { class: "mb-8 text-center" }, [
                h('div', { class: "w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20" }, [
                    h('span', { class: "material-icons-round text-primary text-4xl" }, 'auto_awesome')
                ]),
                h('h1', { class: "text-3xl font-black tracking-tighter" }, "Presque fini !"),
                h('p', { class: "text-slate-500 dark:text-slate-400 font-medium text-sm mt-2" }, "Personnalise ton profil pour rejoindre la communauté.")
            ]),

            h('div', { class: "space-y-6 flex-1" }, [
                h('div', { class: "space-y-2" }, [
                    h('label', { class: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1" }, "TA BIO (CITATION, HUMEUR...)"),
                    h('textarea', {
                        value: bio.value,
                        onInput: (e: any) => bio.value = e.target.value,
                        placeholder: "Ex: Futurs ingénieurs en AGRO. Fan de basket et de tech.",
                        class: "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[22px] px-6 py-4 text-sm font-medium focus:ring-primary min-h-[120px] resize-none dark:text-white"
                    })
                ]),

                h('div', { class: "space-y-2" }, [
                    h('label', { class: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1" }, "STATUT MATRIMONIAL"),
                    h('select', {
                        value: maritalStatus.value,
                        onChange: (e: any) => maritalStatus.value = e.target.value,
                        class: "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[22px] px-6 py-4 text-sm font-bold dark:text-white"
                    }, [
                        h('option', { value: 'celibataire' }, "Célibataire"),
                        h('option', { value: 'en_couple' }, "En couple"),
                        h('option', { value: 'marie' }, "Marié(e)"),
                        h('option', { value: 'complique' }, "C'est compliqué")
                    ])
                ]),

                h('div', { class: "space-y-2" }, [
                    h('label', { class: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1" }, "RÉSIDENCE UNIVERSITAIRE"),
                    h('select', {
                        value: residence.value,
                        onChange: (e: any) => residence.value = e.target.value,
                        class: "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[22px] px-6 py-4 text-sm font-bold dark:text-white"
                    }, residences.map(r => h('option', { value: r }, r === 'externe' ? 'Externe (En ville)' : r)))
                ])
            ]),

            h('button', {
                onClick: handleSubmit,
                disabled: !bio.value.trim(),
                class: "mt-8 w-full bg-primary text-white font-black py-5 rounded-[24px] shadow-xl active:scale-95 disabled:opacity-20 transition-all uppercase tracking-widest text-sm"
            }, "Commencer l'Arène")
        ]);
    }
});
