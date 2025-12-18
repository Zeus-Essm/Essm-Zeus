
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

// Pastas de outras categorias agora são vazias para permitir criação dinâmica pelo usuário empresa
export const RESTAURANT_SHOP_CATEGORIES: { id: string; name: string; image: string }[] = [];
export const SUPERMARKET_SHOP_CATEGORIES: { id: string; name: string; image: string }[] = [];
export const BEAUTY_SHOP_CATEGORIES: { id: string; name: string; image: string }[] = [];
export const TECHNOLOGY_SHOP_CATEGORIES: { id: string; name: string; image: string }[] = [];
export const DECORATION_SHOP_CATEGORIES: { id: string; name: string; image: string }[] = [];

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
