// FIX: Removed circular import and defined MarketplaceType.
export type MarketplaceType = 'fashion' | 'restaurant' | 'supermarket' | 'beauty' | 'technology';

export enum Screen {
  Splash,
  Login,
  Home,
  Settings,
  SubCategorySelection,
  ItemSelection,
  Generating,
  Result,
  Confirmation,
  Feed,
  MyLooks,
  Camera,
  ImageSourceSelection,
  Cart,
  Rewards,
  ChatList, // Nova tela de lista de chats
  Chat,     // Nova tela de chat individual
}

export interface SubCategory {
  id: string;
  name: string;
  image: string;
  subCategories?: SubCategory[];
}

export interface Category {
  id:string;
  name: string;
  image: string;
  video?: string;
  type: MarketplaceType;
  subCategories?: SubCategory[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  isTryOn?: boolean;
  beautyType?: 'lipstick' | 'eyeshadow' | 'wig' | 'general';
}

export interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string; // ISO string
}

export interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  image: string; // Thumbnail/poster for videos
  video?: string; // Optional video URL
  items: Item[];
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  commentCount: number;
}

export interface SavedLook {
  id: string;
  image: string;
  items: Item[];
}

export interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  backgroundImage: string;
}

export interface Profile {
  id: string;
  username: string;
  bio?: string;
  profile_image_url?: string;
  cover_image_url?: string;
}

export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  relatedCategoryId?: string;
}

// Novo tipo para mensagens de chat
export interface Message {
  id: string;
  text: string;
  senderId: string; // ID do usuário que enviou
  timestamp: string; // Usar string para facilitar a serialização
}

// Novo tipo para conversas
export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
  };
  lastMessage: Message;
  unreadCount: number;
}