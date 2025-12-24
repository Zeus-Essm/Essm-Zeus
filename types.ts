// src/types.ts

export type MarketplaceType =
  | 'fashion'
  | 'restaurant'
  | 'supermarket'
  | 'beauty'
  | 'technology'
  | 'decoration';

// === SUPABASE TYPES (Alinhado com o JSON do Banco de Dados) ===

export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Profile {
  user_id: string;        // PK alinhada com auth.users
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  account_type: 'personal' | 'business' | null;
  verification_status?: 'unverified' | 'pending' | 'verified';
  reward_points?: number;
  email?: string;
}

export interface Folder {
  id: string;
  owner_id: string;
  title: string;
  cover_image: string | null;
  created_at: string;
  // Item count é calculado no front ou via query, não é coluna direta
  item_count?: number;
}

export interface Product {
  id: string;
  owner_id: string;
  folder_id: string | null;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  is_try_on: boolean; // Atenção: snake_case (banco de dados)
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  video_url?: string;
  caption?: string;
  likes_count: number;
  is_sponsored: boolean;
  created_at: string;
  
  // Dados unidos (Joins)
  profiles?: Profile; 
  
  // === UI PROPERTIES (Added to fix component errors) ===
  // Many components expect these properties based on common social UI patterns
  user: User;
  image: string;
  video?: string;
  likes: number;
  isSponsored: boolean;

  // Estados de UI
  isLiked?: boolean;
  comments: Comment[];
  commentCount: number;
  items: Item[]; // Produtos marcados no post
}

// === UI TYPES (Interfaces visuais) ===

export interface Item {
  // Adaptador para usar Produtos na interface de Try-On
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  
  isTryOn?: boolean; // UI usa camelCase
  folder_id?: string | null;
  owner_id?: string;
  
  // Outros campos de UI
  vendorSubCategory?: string;
  recommendationVideo?: string;
  beautyType?: 'lipstick' | 'wig' | 'eyeshadow';
  gender?: 'male' | 'female' | 'kid' | 'unisex';
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
}

// Added missing Story type used in FeedScreen
export interface Story {
  id: string;
  user: User;
  image_url: string;
  created_at: string;
}

// Added missing Message type used in ChatScreen
export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

// Added missing Conversation type used in ChatListScreen and ChatScreen
export interface Conversation {
  id: string;
  participant: User;
  lastMessage: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
}

// Added missing CollaborationPost type used in VendorCollaborationsScreen
export interface CollaborationPost {
  id: string;
}

// Added missing SavedLook type used in MyLooksScreen
export interface SavedLook {
  id: string;
  image: string;
  items: Item[];
}

// Added missing InfluencerAffiliationRequest type used in VendorAffiliatesScreen
export interface InfluencerAffiliationRequest {
  id: string;
}

export enum Screen {
  Splash,
  Login,                 // Adicionado
  AccountTypeSelection,
  VendorDashboard,
  VendorAnalytics,
  VendorProducts,
  Home,
  Feed,
  Cart,
  Search,
  Settings,
  ImageSourceSelection,
  Camera,
  SubCategorySelection,
  ItemSelection,
  Generating,
  Result,
  Confirmation,
  // Telas extras do seu código original
  BusinessOnboarding,
  VendorAffiliates,
  VendorCollaborations,
  MyLooks,
  Rewards,
  ChatList,
  Chat,
  AllHighlights,
  VerificationIntro,
  IdUpload,
  FaceScan,
  VerificationPending,
  SplitCamera,
  VideoEdit,
  DecorationPlacement
}

export interface BusinessProfile {
  id: string;
  business_name: string;
  business_category: string;
  description: string;
  logo_url: string;
}

export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  relatedCategoryId?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  image: string;
  subCategories?: SubCategory[];
}

export interface Category extends SubCategory {
  video?: string;
  type: MarketplaceType;
  isAd?: boolean;
}