
import type { Category, Item, Post, Story, Conversation, CollaborationPost } from './types';

// Sub-categorias de Roupas reutilizáveis
export const MALE_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/fLHkb25Z/ICONS8.jpg' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

export const FEMALE_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/VLV716TV/Gemini_Generated_Image_1pwnnv1pwnnv1pwn.png' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'saia', name: 'Saia', image: 'https://i.postimg.cc/B6Nf5VcY/Gemini_Generated_Image_4ugkqh4ugkqh4ugk.png' },
    { id: 'vestido', name: 'Vestido', image: 'https://i.postimg.cc/rmg2GPCb/Gemini_Generated_Image_x48n1sx48n1sx48n.png' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

export const KID_CLOTHING_SUBCATEGORIES = [
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

const DELICIAS_DA_LEANDRA_SUBCATEGORIES = [
    { id: 'bolos', name: 'Bolos', image: 'https://i.postimg.cc/L5BvGFbb/PHOTO-2025-07-14-23-58-55.jpg' },
];

const CLUB_S_SUBCATEGORIES = [
    { id: 'pratos', name: 'Pratos', image: 'https://i.postimg.cc/XYJ6b4NT/Gemini_Generated_Image_1eva5i1eva5i1eva-1.png' },
];

const DECORATION_SUBCATEGORIES = [
    { id: 'moveis', name: 'Móveis', image: 'https://i.postimg.cc/tTm74FhJ/mdc.png' },
];

export const RESTAURANT_SHOP_CATEGORIES = [
    { id: 'pratos', name: 'Pratos', image: 'https://i.postimg.cc/XYJ6b4NT/Gemini_Generated_Image_1eva5i1eva5i1eva-1.png' },
    { id: 'sobremesas', name: 'Sobremesas', image: 'https://i.postimg.cc/L5BvGFbb/PHOTO-2025-07-14-23-58-55.jpg' },
    { id: 'bebidas', name: 'Bebidas', image: 'https://i.postimg.cc/tC39yWny/Gemini_Generated_Image_henwbohenwbohenw.png' },
];

export const SUPERMARKET_SHOP_CATEGORIES = [
    { id: 'mercearia', name: 'Mercearia', image: 'https://i.postimg.cc/15GyPwVS/Gemini_Generated_Image_euq60jeuq60jeuq6.png' },
    { id: 'padaria', name: 'Padaria', image: 'https://i.postimg.cc/VvB42PVh/PHOTO-2025-03-03-19-26-45.jpg' },
    { id: 'talho', name: 'Talho', image: 'https://i.postimg.cc/HsqHQjwp/Gemini_Generated_Image_sa7g1ysa7g1ysa7g.png' },
    { id: 'bebidas', name: 'Bebidas', image: 'https://i.postimg.cc/tC39yWny/Gemini_Generated_Image_henwbohenwbohenw.png' },
];

export const BEAUTY_SHOP_CATEGORIES = [
    { id: 'maquilhagem', name: 'Maquilhagem', image: 'https://i.postimg.cc/YS6p2Fsd/Gemini_Generated_Image_fz7zo1fz7zo1fz7z.png' },
    { id: 'cabelo', name: 'Cabelo', image: 'https://i.postimg.cc/BvTqZFVN/Gemini_Generated_Image_3ps4k73ps4k73ps4.png' },
    { id: 'pele', name: 'Pele', image: 'https://i.postimg.cc/k5QnMSp1/Gemini_Generated_Image_a9r49ea9r49ea9r4.png' },
    { id: 'peruca', name: 'Peruca', image: 'https://i.postimg.cc/6Q1TQDHK/81e_CCdc_Mv_ZL_SL1500.jpg' },
    { id: 'makeup', name: 'Makeup', image: 'https://i.postimg.cc/Hx3xYJvP/469854347_597462169307087_8299951859133309802_n.jpg' },
];

export const TECHNOLOGY_SHOP_CATEGORIES = [
    { id: 'telemoveis', name: 'Telemóveis', image: 'https://i.postimg.cc/ZKszJHKK/Gemini_Generated_Image_lrcnu0lrcnu0lrcn.png' },
    { id: 'computadores', name: 'Computadores', image: 'https://i.postimg.cc/rFZ2qjFs/Gemini_Generated_Image_uvwovcuvwovcuvwo.png' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/zvBNVxMw/louis-vuitton-1-1-millionaires-Z1165-E-PM2-Front-view.webp' },
];

export const DECORATION_SHOP_CATEGORIES = [
    { id: 'moveis', name: 'Móveis', image: 'https://i.postimg.cc/tTm74FhJ/mdc.png' },
];

const createSubCategories = (parentId: string, subCategories: {id: string, name: string, image: string}[]) => {
    return subCategories.map(sc => ({ ...sc, id: `${parentId}_${sc.id}` }));
};

export const CATEGORIES: Category[] = [
  { 
    id: 'lv', 
    name: 'Louis Vuitton', 
    image: 'https://i.postimg.cc/xCknv8vV/pexels-rdne-6224633.jpg',
    video: 'https://files.catbox.moe/ctk28a.mp4',
    type: 'fashion',
    subCategories: [
        { id: 'lv_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('lv_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lv_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('lv_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lv_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('lv_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'new_feeling',
    name: 'NEW FEELING',
    image: 'https://i.postimg.cc/pTbvCjjp/NEW-FEELING.png',
    video: 'https://files.catbox.moe/joiet2.mp4',
    type: 'fashion',
    subCategories: [
        { id: 'nf_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('nf_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('nf_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('nf_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'noivas',
    name: 'Noivas',
    image: 'https://i.postimg.cc/G3vH75kZ/465687536-1138426001618419-59111119315795457782-n.jpg',
    type: 'fashion',
    subCategories: [
        { id: 'noivas_vestido', name: 'Vestido', image: 'https://i.postimg.cc/gkPXMMRL/noivas.png' },
        { id: 'noivas_sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
        { id: 'noivas_acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' }
    ]
  },
  {
    id: 'adidas',
    name: 'Adidas',
    image: 'https://i.postimg.cc/LXmdq4H2/D.jpg',
    type: 'fashion',
    subCategories: [
        { id: 'ad_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('ad_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'ad_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('ad_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
    ]
  },
  {
    id: 'lilas',
    name: 'Lilás',
    image: 'https://i.postimg.cc/7Z9pT8Wk/L.jpg',
    type: 'fashion',
    subCategories: createSubCategories('lilas', FEMALE_CLOTHING_SUBCATEGORIES)
  },
  {
    id: 'restaurantes',
    name: 'Delicias da Leandra',
    image: 'https://i.postimg.cc/WzRfQnbd/Delicias-da-Leandra.jpg',
    type: 'restaurant',
    subCategories: createSubCategories('restaurantes', DELICIAS_DA_LEANDRA_SUBCATEGORIES)
  },
  {
    id: 'clubs',
    name: 'Club S',
    image: 'https://i.postimg.cc/Yq8BZhk2/Gemini_Generated_Image_dc3csmdc3csmdc3c.png',
    type: 'restaurant',
    subCategories: createSubCategories('clubs', CLUB_S_SUBCATEGORIES)
  },
  {
    id: 'supermercados',
    name: 'Kero',
    image: 'https://i.postimg.cc/15GyPwVS/Gemini_Generated_Image_euq60jeuq60jeuq6.png',
    type: 'supermarket',
    subCategories: [
        { id: 'supermercados_gasosa', name: 'Gasosa', image: 'https://i.postimg.cc/tC39yWny/Gemini_Generated_Image_henwbohenwbohenw.png' }
    ]
  },
  {
    id: 'beleza',
    name: 'Bonita',
    image: 'https://i.postimg.cc/Hx3xYJvP/469854347_597462169307087_8299951859133309802_n.jpg',
    type: 'beauty',
    subCategories: [
        { id: 'beleza_linda', name: 'Linda', image: 'https://i.postimg.cc/YS6p2Fsd/Gemini_Generated_Image_fz7zo1fz7zo1fz7z.png' },
        { id: 'beleza_peruca', name: 'Peruca', image: 'https://i.postimg.cc/6Q1TQDHK/81e_CCdc_Mv_ZL_SL1500.jpg' },
        { id: 'beleza_makeup', name: 'Makeup', image: 'https://i.postimg.cc/Hx3xYJvP/469854347_597462169307087_8299951859133309802_n.jpg' }
    ]
  },
  {
    id: 'tecnologia',
    name: 'Apple',
    image: 'https://i.postimg.cc/rFZ2qjFs/Gemini_Generated_Image_uvwovcuvwovcuvwo.png',
    type: 'technology',
    subCategories: [
        { id: 'tecnologia_Iphone', name: 'Iphone', image: 'https://i.postimg.cc/ZKszJHKK/Gemini_Generated_Image_lrcnu0lrcnu0lrcn.png' }
    ]
  },
  {
    id: 'mdc',
    name: 'MDC',
    image: 'https://i.postimg.cc/tTm74FhJ/mdc.png',
    type: 'decoration',
    subCategories: createSubCategories('mdc', DECORATION_SUBCATEGORIES)
  }
];

export const ITEMS: Item[] = [
    { id: 'item3', name: 'Vestido de Gala LV', description: 'Vestido longo de seda para ocasiões especiais.', category: 'lv_feminino_vestido', image: 'https://i.postimg.cc/k47jSjPj/vestido-lv-fem-1.jpg', price: 15000, recommendationVideo: 'https://files.catbox.moe/ctk28a.mp4' },
    { id: 'item4', name: 'Vestido Casual Monograma', description: 'Vestido confortável para o dia a dia.', category: 'lv_feminino_vestido', image: 'https://i.postimg.cc/C1QZ8L1k/vestido-lv-fem-2.jpg', price: 7500 },
    { id: 'item5', name: 'Saia Jeans New Feeling', description: 'Saia jeans moderna.', category: 'nf_feminino_saia', image: 'https://i.postimg.cc/8z7xQ9WY/saia-nf-fem-1.jpg', price: 250 },
    { id: 'item6', name: 'Saia Plissada New Feeling', description: 'Saia plissada pastel.', category: 'nf_feminino_saia', image: 'https://i.postimg.cc/J0vP8g1G/saia-nf-fem-2.jpg', price: 320, recommendationVideo: 'https://files.catbox.moe/joiet2.mp4' },
    { id: 'item7', name: 'Adidas Ultraboost', description: 'Ténis de corrida premium.', category: 'ad_masculino_tenis', image: 'https://i.postimg.cc/Hnpy6yvK/tenis-ad-masc-1.jpg', price: 900 },
    { id: 'item8', name: 'Adidas Superstar', description: 'O clássico icônico.', category: 'ad_masculino_tenis', image: 'https://i.postimg.cc/J0tL2y08/tenis-ad-masc-2.jpg', price: 450 },
    { id: 'item15', name: 'fato 1', description: 'Fato Louis Vuitton.', category: 'lv_masculino_fato', image: 'https://i.postimg.cc/tg58WhFB/louis-vuitton-terno-pont-neuf-em-la-HQCF4-WAVD631-PM2-Front-view.webp', price: 20000 },
    { id: 'item20', name: 'ténis 1', description: 'Ténis LV Skate.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/VvTx5mX1/louis-vuitton-sneaker-lv-skate-BO9-U3-PMI31-PM2-Front-view.webp', price: 20000 },
    { id: 'item25', name: 'óculos 1', description: 'Óculos LV.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/zvBNVxMw/louis-vuitton-1-1-millionaires-Z1165-E-PM2-Front-view.webp', price: 20000 },
    { id: 'deco-1', name: 'deco 1', description: 'Móvel MDC.', category: 'mdc_moveis', image: 'https://i.postimg.cc/m2Jn3Tvt/Captura_de_Tela_2025_11_30_a_s_6_28_07_PM_Photoroom.png', price: 20000 },
];

export const INITIAL_STORIES: Story[] = [];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_VENDOR_ITEMS: Item[] = [];

export const VENDOR_POSTS: Post[] = [];

export const INITIAL_COLLABORATION_REQUESTS: CollaborationPost[] = [];

export const FASHION_MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_2d01d690f7.mp3';
