
import type { Category, Item, Post, Story, Conversation, CollaborationPost } from './types';

// Sub-categorias vazias ou genéricas para estrutura
export const MALE_CLOTHING_SUBCATEGORIES = [];
export const FEMALE_CLOTHING_SUBCATEGORIES = [];
export const KID_CLOTHING_SUBCATEGORIES = [];

// Categorias de Mercado (Mantendo a estrutura de tipos, mas sem dados fictícios de marcas)
export const CATEGORIES: Category[] = [
  { id: 'fashion', name: 'Moda', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000', type: 'fashion' },
  { id: 'restaurant', name: 'Restaurantes', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000', type: 'restaurant' },
  { id: 'supermarket', name: 'Supermercado', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000', type: 'supermarket' },
  { id: 'beauty', name: 'Beleza', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000', type: 'beauty' },
  { id: 'technology', name: 'Tecnologia', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000', type: 'technology' },
  { id: 'decoration', name: 'Decoração', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000', type: 'decoration' }
];

export const ITEMS: Item[] = [];
export const INITIAL_STORIES: Story[] = [];
export const INITIAL_POSTS: Post[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_VENDOR_ITEMS: Item[] = [];
export const VENDOR_POSTS: Post[] = [];
export const INITIAL_COLLABORATION_REQUESTS: CollaborationPost[] = [];

export const RESTAURANT_SHOP_CATEGORIES = [];
export const SUPERMARKET_SHOP_CATEGORIES = [];
export const BEAUTY_SHOP_CATEGORIES = [];
export const TECHNOLOGY_SHOP_CATEGORIES = [];
export const DECORATION_SHOP_CATEGORIES = [];

export const FASHION_MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_2d01d690f7.mp3';
