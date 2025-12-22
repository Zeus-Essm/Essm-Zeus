
import type { Category, Item, Post, Story, Conversation, CollaborationPost } from './types';

// Estruturas de Sub-categorias (Pastas)
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

// Lojas Reais do Mercado (Baseado na imagem)
export const CATEGORIES: Category[] = [
    {
        id: 'lv',
        name: 'LOUIS VUITTON',
        image: 'https://i.postimg.cc/xCknv8vV/pexels-rdne-6224633.jpg',
        video: 'https://files.catbox.moe/ctk28a.mp4',
        type: 'fashion',
        subCategories: FEMALE_CLOTHING_SUBCATEGORIES,
        isAd: true
    },
    {
        id: 'new_feeling',
        name: 'NEW FEELING',
        image: 'https://i.postimg.cc/pTbvCjjp/NEW-FEELING.png',
        video: 'https://files.catbox.moe/joiet2.mp4',
        type: 'fashion',
        subCategories: MALE_CLOTHING_SUBCATEGORIES,
        isAd: true
    },
    {
        id: 'noivas',
        name: 'NOIVAS',
        image: 'https://i.postimg.cc/vTfR0Rxy/wedding-dress.jpg',
        type: 'fashion',
        subCategories: [],
        isAd: true
    },
    {
        id: 'adidas',
        name: 'ADIDAS',
        image: 'https://i.postimg.cc/LXmdq4H2/D.jpg',
        type: 'fashion',
        subCategories: MALE_CLOTHING_SUBCATEGORIES,
        isAd: true
    },
    {
        id: 'lilas',
        name: 'LILÁS',
        image: 'https://i.postimg.cc/85zX6F8F/lilas-brand.jpg',
        type: 'fashion',
        subCategories: [],
        isAd: true
    }
];

export const ITEMS: Item[] = [];
export const INITIAL_STORIES: Story[] = [];
export const INITIAL_POSTS: Post[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_VENDOR_ITEMS: Item[] = [];
export const VENDOR_POSTS: Post[] = [];
export const INITIAL_COLLABORATION_REQUESTS: CollaborationPost[] = [];
export const FASHION_MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_2d01d690f7.mp3';