
import { defineComponent, ref, h, onMounted, onUnmounted } from 'vue';
import { db } from '../services/db';

interface Product {
  id: string;
  title: string;
  price: string;
  location: string;
  image?: string;
  category: string;
  seller: string;
  description: string;
}

const CATEGORIES = ['Tous', 'Électronique', 'Cours', 'Accessoires', 'Logement', 'Autre'];

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', title: 'Dell Latitude', price: '175.000', location: 'Zongo', category: 'Électronique', seller: 'Moussa K.', description: "Excellent état, idéal pour les cours." },
  { id: '2', title: 'Fascicule Macro L1', price: '1.500', location: 'Campus Nord', category: 'Cours', seller: 'Jean P.', description: 'Support complet S1.' },
  { id: '3', title: 'Casque JBL', price: '12.000', location: 'Banikanni', category: 'Accessoires', seller: 'Sarah L.', description: 'Quasi neuf, très bon son.' },
  { id: '4', title: 'Chambre meublée', price: '20.000', location: 'Zongo', category: 'Logement', seller: 'Ibrahim D.', description: 'Chambre propre près du campus. Eau incluse.' },
  { id: '5', title: 'Cours de droit L2', price: '800', location: 'FDSP', category: 'Cours', seller: 'Aïcha M.', description: 'Polycopiés complets S1+S2.' },
];

export default defineComponent({
  name: 'MarketplaceView',
  props: {
    isEcoMode: { type: Boolean, required: true }
  },
  setup(props) {
    const products = ref<Product[]>([]);
    const selectedProduct = ref<Product | null>(null);
    const activeCategory = ref('Tous');
    const isPosting = ref(false);
    const form = ref({ title: '', price: '', location: '', category: 'Électronique', description: '' });
    let unsubscribe: any = null;

    onMounted(() => {
      unsubscribe = (db as any).subscribeProducts((newProducts: any) => {
        products.value = newProducts.length > 0 ? newProducts : DEFAULT_PRODUCTS;
      });
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    const filteredProducts = () => activeCategory.value === 'Tous'
      ? products.value
      : products.value.filter(p => p.category === activeCategory.value);

    const submitProduct = async () => {
      if (!form.value.title.trim() || !form.value.price.trim() || !form.value.location.trim()) return;
      const profile = db.getProfile();
      const p: Partial<Product> = {
        title: form.value.title.trim(),
        price: form.value.price.trim(),
        location: form.value.location.trim(),
        category: form.value.category,
        seller: profile.name,
        description: form.value.description.trim() || 'Contactez-moi pour plus d\'infos.',
      };
      await (db as any).addProduct(p);
      form.value = { title: '', price: '', location: '', category: 'Électronique', description: '' };
      isPosting.value = false;
    };

    const categoryIcons: Record<string, string> = {
      'Électronique': 'laptop',
      'Cours': 'menu_book',
      'Accessoires': 'headphones',
      'Logement': 'home',
      'Autre': 'category',
    };

    const renderDetail = (p: Product) => h('div', { class: "flex flex-col min-h-full bg-white dark:bg-background-dark" }, [
      h('header', { class: "sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 ios-blur px-4 py-3 border-b border-primary/10 flex items-center justify-between" }, [
        h('button', { onClick: () => selectedProduct.value = null, class: "flex items-center text-primary font-bold gap-1" }, [
          h('span', { class: "material-icons-round" }, 'chevron_left'), 'Retour'
        ]),
        h('span', { class: "text-sm font-bold opacity-40" }, 'Marché Parakou')
      ]),
      h('div', { class: "p-5 space-y-5 pb-32" }, [
        h('span', { class: "bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase" }, p.category),
        h('h1', { class: "text-2xl font-black mt-2" }, p.title),
        h('div', { class: "text-3xl font-black text-primary" }, [p.price, h('span', { class: "text-sm font-normal text-slate-500" }, ' FCFA')]),

        h('div', { class: "aspect-video rounded-[28px] overflow-hidden bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center" }, [
          h('div', { class: "flex flex-col items-center gap-3 opacity-30" }, [
            h('span', { class: "material-icons-round text-6xl" }, categoryIcons[p.category] || 'category'),
            h('span', { class: "text-xs font-bold uppercase" }, p.category)
          ])
        ]),

        h('div', { class: "bg-slate-50 dark:bg-white/5 rounded-[20px] p-4" }, [
          h('p', { class: "text-[10px] font-black uppercase tracking-widest opacity-40 mb-2" }, "Description"),
          h('p', { class: "text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium" }, p.description)
        ]),

        h('div', { class: "flex items-center gap-3" }, [
          h('div', { class: "w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center" }, [
            h('span', { class: "material-icons-round" }, 'person')
          ]),
          h('div', [
            h('p', { class: "text-sm font-black" }, p.seller),
            h('div', { class: "flex items-center gap-1 text-[10px] opacity-40 font-bold" }, [
              h('span', { class: "material-icons-round text-xs" }, 'location_on'),
              p.location
            ])
          ])
        ])
      ]),
      h('div', { class: "fixed bottom-0 inset-x-0 p-4 pb-10 ios-blur border-t border-primary/10 grid grid-cols-2 gap-4" }, [
        h('button', { class: "border-2 border-primary text-primary font-bold py-4 rounded-2xl active:scale-95 transition-transform" }, 'WhatsApp'),
        h('button', { class: "bg-primary text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-primary/20" }, 'Message')
      ])
    ]);

    return () => selectedProduct.value ? renderDetail(selectedProduct.value) : h('div', { class: "flex flex-col min-h-full" }, [
      h('div', { class: "px-5 pt-6 pb-4 border-b border-primary/5 space-y-4" }, [
        h('h1', { class: "text-2xl font-black" }, ['Marché ', h('span', { class: "text-primary" }, 'Parakou')]),
        h('div', { class: "flex overflow-x-auto no-scrollbar gap-2" },
          CATEGORIES.map(cat => h('button', {
            key: cat,
            onClick: () => activeCategory.value = cat,
            class: `whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${activeCategory.value === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary'}`
          }, cat))
        )
      ]),

      h('div', { class: "grid grid-cols-2 gap-3 p-4 pb-28" },
        filteredProducts().map(p => h('div', {
          key: p.id,
          onClick: () => selectedProduct.value = p,
          class: "bg-white dark:bg-white/5 rounded-[28px] overflow-hidden border border-slate-100 dark:border-white/5 active:scale-95 transition-transform shadow-sm cursor-pointer"
        }, [
          h('div', { class: "w-full aspect-square bg-primary/5 flex items-center justify-center" }, [
            h('span', { class: "material-icons-round text-4xl text-primary/30" }, categoryIcons[p.category] || 'category')
          ]),
          h('div', { class: "p-3" }, [
            h('span', { class: "text-[8px] font-black uppercase text-primary/60 tracking-widest" }, p.category),
            h('h3', { class: "text-[11px] font-bold truncate mt-0.5" }, p.title),
            h('p', { class: "text-primary font-black text-sm mt-1" }, [p.price, h('span', { class: "text-[8px] opacity-40 ml-1" }, 'FCFA')]),
            h('div', { class: "flex items-center gap-1 opacity-40 mt-1" }, [
              h('span', { class: "material-icons-round text-[10px]" }, 'location_on'),
              h('span', { class: "text-[9px] font-bold" }, p.location)
            ])
          ])
        ]))
      ),

      // Modale ajout article
      isPosting.value ? h('div', { class: "fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-end sm:items-center justify-center" }, [
        h('div', { class: "bg-white dark:bg-[#1a1d23] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-6 pb-12 sm:pb-6 flex flex-col gap-4" }, [
          h('div', { class: "flex items-center justify-between" }, [
            h('h3', { class: "text-xl font-black" }, "Vendre un article"),
            h('button', { onClick: () => isPosting.value = false, class: "p-2 opacity-40" }, [h('span', { class: "material-icons-round" }, 'close')])
          ]),
          ...[
            { key: 'title', placeholder: "Ex: Dell Latitude Core i5", label: 'Article' },
            { key: 'price', placeholder: "Ex: 85000", label: 'Prix (FCFA)', type: 'number' },
            { key: 'location', placeholder: "Ex: Zongo, Banikanni...", label: 'Lieu de vente' },
            { key: 'description', placeholder: "Décris l'état, les détails...", label: 'Description' },
          ].map(field => h('div', { class: "flex flex-col gap-1" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40" }, field.label),
            field.key === 'description'
              ? h('textarea', {
                value: (form.value as any)[field.key],
                onInput: (e: any) => (form.value as any)[field.key] = e.target.value,
                placeholder: field.placeholder,
                class: "bg-slate-50 dark:bg-white/5 rounded-2xl px-4 py-3 text-sm font-medium border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white resize-none h-20"
              })
              : h('input', {
                value: (form.value as any)[field.key],
                type: field.type || 'text',
                onInput: (e: any) => (form.value as any)[field.key] = e.target.value,
                placeholder: field.placeholder,
                class: "bg-slate-50 dark:bg-white/5 rounded-2xl px-4 py-4 text-sm font-medium border border-slate-100 dark:border-white/5 focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
              })
          ])),
          // Catégorie select
          h('div', { class: "flex flex-col gap-1" }, [
            h('label', { class: "text-[10px] font-black uppercase tracking-widest opacity-40" }, "Catégorie"),
            h('select', {
              value: form.value.category,
              onChange: (e: any) => form.value.category = e.target.value,
              class: "bg-slate-50 dark:bg-white/5 rounded-2xl px-4 py-4 text-sm font-medium border border-slate-100 dark:border-white/5 outline-none dark:text-white"
            }, CATEGORIES.filter(c => c !== 'Tous').map(cat => h('option', { value: cat }, cat)))
          ]),
          h('button', {
            onClick: submitProduct,
            disabled: !form.value.title.trim() || !form.value.price.trim() || !form.value.location.trim(),
            class: "w-full bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 disabled:opacity-20 active:scale-95 transition-all"
          }, "Mettre en vente")
        ])
      ]) : null,

      // FAB
      h('button', {
        onClick: () => isPosting.value = true,
        class: "fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl z-40 active:scale-95 transition-transform"
      }, [h('span', { class: "material-icons-round text-3xl" }, 'add')])
    ]);
  }
});