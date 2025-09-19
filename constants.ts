
import type { Category, Item, Post, Story } from './types';

// Sub-categorias de Roupas reutilizáveis
const MALE_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/fLHkb25Z/ICONS8.jpg' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

const FEMALE_CLOTHING_SUBCATEGORIES = [
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'saia', name: 'Saia', image: 'https://i.postimg.cc/J0k2Vz7x/ICONS11.jpg' },
    { id: 'vestido', name: 'Vestido', image: 'https://i.postimg.cc/prdkxSjC/ICONS10.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

const KID_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/fLHkb25Z/ICONS8.jpg' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'saia', name: 'Saia', image: 'https://i.postimg.cc/J0k2Vz7x/ICONS11.jpg' },
    { id: 'vestido', name: 'Vestido', image: 'https://i.postimg.cc/prdkxSjC/ICONS10.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

// Helper para criar subcategorias com IDs únicos
const createSubCategories = (parentId: string, subCategories: {id: string, name: string, image: string}[]) => {
    return subCategories.map(sc => ({ ...sc, id: `${parentId}_${sc.id}` }));
};


// As categorias de coleções
export const CATEGORIES: Category[] = [
  { 
    id: 'lv', 
    name: 'Louis Vuitton', 
    image: 'https://i.postimg.cc/xCknv8vV/pexels-rdne-6224633.jpg',
    video: 'https://streamable.com/f79d27/video.mp4',
    subCategories: [
        { id: 'lv_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('lv_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lv_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('lv_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lv_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('lv_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'new_feeling',
    name: 'NEW FEELING',
    image: 'https://i.postimg.cc/P5K1G2Py/new.jpg',
    subCategories: [
        { id: 'nf_masculino', name: 'Masculino', image: 'https://i.postimg.cc/fT8c1V8q/nf-men.jpg', subCategories: createSubCategories('nf_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_feminino', name: 'Feminino', image: 'https://i.postimg.cc/sXv7xX6K/nf-women.jpg', subCategories: createSubCategories('nf_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_crianca', name: 'Criança', image: 'https://i.postimg.cc/prgQkDBL/nf-kid.jpg', subCategories: createSubCategories('nf_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'noivas',
    name: 'NOIVAS',
    image: 'https://i.postimg.cc/G3vH75kZ/465687536-1138426001618419-59111119315795457782-n.jpg',
    subCategories: [
        { id: 'noivas_vestidos', name: 'Vestidos', image: 'https://i.postimg.cc/QdZ0c2s5/bride-dresses.jpg' },
        { id: 'noivas_noivos', name: 'Noivos', image: 'https://i.postimg.cc/0j2gKzDF/groom-suits.jpg' },
        { id: 'noivas_criancas', name: 'Crianças', image: 'https://i.postimg.cc/PqjM9g8L/wedding-kids.jpg' }
    ]
  },
  {
    id: 'lilas',
    name: 'LILAS',
    image: 'https://i.postimg.cc/7Z9pT8Wk/L.jpg',
    subCategories: [
        { id: 'lilas_masculino', name: 'Masculino', image: 'https://i.postimg.cc/fyy2v7s0/lilas-men.jpg', subCategories: createSubCategories('lilas_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lilas_feminino', name: 'Feminino', image: 'https://i.postimg.cc/WbFfVw8d/lilas-women.jpg', subCategories: createSubCategories('lilas_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lilas_crianca', name: 'Criança', image: 'https://i.postimg.cc/mDcf1W0w/lilas-kid.jpg', subCategories: createSubCategories('lilas_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  }
];

// Itens de exemplo (mesma estrutura que antes)
export const ITEMS: Item[] = [
    // Louis Vuitton Masculino
    { id: 'lv_masculino_fato_1', name: 'Fato Clássico Monogram', description: 'Um fato elegante com o padrão Monogram da Louis Vuitton.', category: 'lv_masculino_fato', image: 'https://i.postimg.cc/y8Yj9WkH/lv-men-suit1.jpg', price: 15000 },
    { id: 'lv_masculino_tshirt_1', name: 'T-shirt LV com Logo', description: 'T-shirt de algodão com logo LV bordado.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/Gpd2YVZY/lv-men-tshirt1.jpg', price: 2500 },
    { id: 'lv_masculino_camisa_1', name: 'Camisa de Seda LV', description: 'Camisa de seda com estampa exclusiva da coleção.', category: 'lv_masculino_camisa', image: 'https://i.postimg.cc/k4xY0VjM/lv-men-shirt1.jpg', price: 4500 },
    { id: 'lv_masculino_calca_1', name: 'Calça Chino LV', description: 'Calça chino de corte moderno e confortável.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/L5Y8kYvg/lv-men-pants1.jpg', price: 3800 },
    { id: 'lv_masculino_jaqueta_1', name: 'Jaqueta Bomber LV', description: 'Jaqueta bomber com detalhes em couro.', category: 'lv_masculino_jaqueta', image: 'https://i.postimg.cc/pr0yM7gY/lv-men-jacket1.jpg', price: 9500 },

    // Louis Vuitton Feminino
    { id: 'lv_feminino_vestido_1', name: 'Vestido de Cocktail LV', description: 'Vestido elegante para ocasiões especiais.', category: 'lv_feminino_vestido', image: 'https://i.postimg.cc/WpX9pL9g/lv-women-dress1.jpg', price: 12000 },
    { id: 'lv_feminino_saia_1', name: 'Saia Plissada Monogram', description: 'Saia plissada com o icônico padrão Monogram.', category: 'lv_feminino_saia', image: 'https://i.postimg.cc/qR3tjXz3/lv-women-skirt1.jpg', price: 5500 },
    { id: 'lv_feminino_tshirt_1', name: 'T-shirt Feminina LV', description: 'T-shirt com corte feminino e logo LV.', category: 'lv_feminino_tshirt', image: 'https://i.postimg.cc/SRhD10N6/lv-women-tshirt1.jpg', price: 2300 },
    
    // Novos Acessórios
    { id: 'lv_feminino_acessorios_1', name: 'Bolsa Speedy LV', description: 'Bolsa clássica em canvas Monogram.', category: 'lv_feminino_acessorios', image: 'https://i.postimg.cc/kXF1pG4j/lv-women-bag1.jpg', price: 8500 },
    { id: 'lv_masculino_acessorios_1', name: 'Cinto LV Initiales', description: 'Cinto de couro com fivela LV.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/tJnB3w0N/lv-men-belt1.jpg', price: 2900 },
    { id: 'lv_feminino_acessorios_2', name: 'Óculos de Sol My Monogram', description: 'Óculos de sol elegantes com detalhes Monogram.', category: 'lv_feminino_acessorios', image: 'https://i.postimg.cc/Gmd0V5zN/lv-women-sunglasses1.jpg', price: 3200 },
    { id: 'lv_masculino_acessorios_2', name: 'Relógio Tambour', description: 'Relógio sofisticado com design exclusivo.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/ydp3D9gM/lv-men-watch1.jpg', price: 25000 },
    { id: 'lv_feminino_acessorios_3', name: 'Lenço de Seda Monogram', description: 'Lenço de seda versátil com estampa Monogram.', category: 'lv_feminino_acessorios', image: 'https://i.postimg.cc/qMQ4wF7p/lv-women-scarf1.jpg', price: 2100 },
];


// Posts iniciais para o feed (exemplo)
export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    user: {
      name: 'camila_fashion',
      avatar: 'https://i.postimg.cc/zX8ZgGg1/vecteezy-portrait-of-a-beautiful-young-woman-with-long-hair-and-35990471.jpg',
    },
    image: 'https://i.postimg.cc/L6W5ntbS/vecteezy-ai-generated-portrait-of-a-beautiful-woman-in-a-stylish-34844601.jpg',
    items: [ITEMS[4], ITEMS[5]],
    likes: 1289,
    isLiked: false,
  },
  {
    id: 'post_2',
    user: {
      name: 'marco_style',
      avatar: 'https://i.postimg.cc/135z5Y42/vecteezy-stylish-man-in-a-studio-shot-32204593.jpg',
    },
    image: 'https://i.postimg.cc/8cK5dMkh/vecteezy-beige-fashion-background-with-girl-28680288.jpg',
    items: [ITEMS[0], ITEMS[1]],
    likes: 345,
    isLiked: true,
  },
  {
    id: 'post_3',
    user: {
      name: 'louisvuitton',
      avatar: 'https://i.postimg.cc/7Z9pT8Wk/L.jpg',
    },
    image: 'https://i.postimg.cc/4yd43yvn/vecteezy-fashionable-young-adult-woman-in-multi-colored-garment-24577243.jpg',
    items: [ITEMS[2], ITEMS[3]],
    likes: 25432,
    isLiked: false,
  },
  {
    id: 'post_4',
    user: {
      name: 'julia_looks',
      avatar: 'https://i.postimg.cc/tJc7g4A9/vecteezy-portrait-of-a-stylish-woman-in-a-hat-32204595.jpg',
    },
    image: 'https://i.postimg.cc/J02rH8Kx/vecteezy-fashion-portrait-stylish-pretty-woman-in-sunglasses-posing-3289139.jpg',
    items: [ITEMS[6], ITEMS[7]],
    likes: 876,
    isLiked: false,
  },
  {
    id: 'post_5',
    user: {
      name: 'ana_trends',
      avatar: 'https://i.postimg.cc/pT3w6gT7/vecteezy-fashion-portrait-of-a-beautiful-young-woman-with-dark-hair-35990473.jpg',
    },
    image: 'https://i.postimg.cc/wMZctM1S/vecteezy-a-woman-in-a-white-dress-and-a-hat-is-posing-for-a-picture-35990485.jpg',
    items: [ITEMS[8], ITEMS[5]],
    likes: 1542,
    isLiked: false,
  },
  {
    id: 'post_6',
    user: {
      name: 'rodrigo_sharp',
      avatar: 'https://i.postimg.cc/C1bQZ6fK/vecteezy-a-man-in-a-suit-and-tie-is-posing-for-a-picture-35990491.jpg',
    },
    image: 'https://i.postimg.cc/WbN1SgBv/vecteezy-a-man-in-a-suit-and-tie-is-posing-for-a-picture-35990479.jpg',
    items: [ITEMS[9], ITEMS[11], ITEMS[0]],
    likes: 789,
    isLiked: true,
  },
  {
    id: 'post_7',
    user: {
      name: 'fashionista_br',
      avatar: 'https://i.postimg.cc/t46Tz9Cg/vecteezy-a-woman-with-long-hair-is-posing-for-a-picture-35990483.jpg',
    },
    image: 'https://i.postimg.cc/6pQpWzL5/vecteezy-a-woman-in-a-white-shirt-and-black-hat-is-posing-for-a-picture-35990487.jpg',
    items: [ITEMS[10], ITEMS[12]],
    likes: 2301,
    isLiked: false,
  },
  {
    id: 'post_8',
    user: {
      name: 'urban_explorer',
      avatar: 'https://i.postimg.cc/2jT1yZk5/vecteezy-a-man-in-a-black-jacket-is-posing-for-a-picture-35990467.jpg',
    },
    image: 'https://i.postimg.cc/sXJ3x23G/vecteezy-a-man-in-a-black-jacket-is-posing-for-a-picture-35990475.jpg',
    items: [ITEMS[4], ITEMS[1]],
    likes: 567,
    isLiked: false,
  },
  {
    id: 'post_9',
    user: {
      name: 'sofia_couture',
      avatar: 'https://i.postimg.cc/mk0jJzCF/vecteezy-a-woman-in-a-black-dress-is-posing-for-a-picture-35990494.jpg',
    },
    image: 'https://i.postimg.cc/2yT9gWwF/vecteezy-a-woman-in-a-black-dress-is-posing-for-a-picture-35990481.jpg',
    items: [ITEMS[6], ITEMS[8]],
    likes: 4123,
    isLiked: true,
  }
];

// Stories iniciais para o feed (exemplo)
export const INITIAL_STORIES: Story[] = [
    {
        id: 'story_1',
        user: { name: 'vogue', avatar: 'https://i.postimg.cc/8cq3J9S8/vogue.jpg' },
        backgroundImage: 'https://i.postimg.cc/HxbYJq13/vogue-story.jpg',
    },
    {
        id: 'story_2',
        user: { name: 'gqbrasil', avatar: 'https://i.postimg.cc/mD8pWqVw/gq.jpg' },
        backgroundImage: 'https://i.postimg.cc/3wLMQxVp/gq-story.jpg',
    },
    {
        id: 'story_3',
        user: { name: 'elle', avatar: 'https://i.postimg.cc/FKHj2Mkd/elle.jpg' },
        backgroundImage: 'https://i.postimg.cc/Y9D5k0P7/elle-story.jpg',
    },
    {
        id: 'story_4',
        user: { name: 'bazaar', avatar: 'https://i.postimg.cc/prc8m7Y5/bazaar.jpg' },
        backgroundImage: 'https://i.postimg.cc/W1D8Hk9w/bazaar-story.jpg',
    },
];
