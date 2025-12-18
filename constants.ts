
import type { Category, Item, Post, Story, Conversation, CollaborationPost } from './types';

// Estruturas de Sub-categorias (Pastas) - Mantidas para organização dos novos vendedores
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

// Listas de Dados Reais - Inicializadas Vazias para o Espaço Real
export const CATEGORIES: Category[] = [];

export const ITEMS: Item[] = [];

export const INITIAL_STORIES: Story[] = [];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_VENDOR_ITEMS: Item[] = [];

export const VENDOR_POSTS: Post[] = [];

export const INITIAL_COLLABORATION_REQUESTS: CollaborationPost[] = [];

export const FASHION_MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_2d01d690f7.mp3';
