
export type MarketplaceType =
  | 'fashion'
  | 'restaurant'
  | 'supermarket'
  | 'beauty'
  | 'technology'
  | 'decoration';

// === SUPABASE DB TYPES ===

export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Profile {
  user_id: string; 
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  account_type: 'personal' | 'business' | null;
  business_category?: string | null;
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
  is_try_on: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  user: User; 
  image: string; 
  image_url?: string;
  video?: string;
  caption?: string;
  likes: number;
  isLiked: boolean;
  is_sponsored?: boolean;
  isSponsored?: boolean;
  created_at: string;
  comments: Comment[];
  commentCount: number;
  items: Item[];
}

// === UI TYPES ===

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  isTryOn?: boolean;
  folder_id?: string | null;
  owner_id?: string;
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

export interface Story {
  id: string;
  user: User;
  image_url: string;
  created_at: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
}

export interface CollaborationPost {
  id: string;
}

export interface SavedLook {
  id: string;
  image: string;
  items: Item[];
}

export interface InfluencerAffiliationRequest {
  id: string;
}

export enum Screen {
  Splash,
  Login,
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
