
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
  id: string; 
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  account_type: 'personal' | 'business' | null;
  business_category?: string | null;
  verification_status?: 'unverified' | 'pending' | 'verified';
  reward_points?: number;
  email?: string;
  // Fix: Added user_id to support access in components like ChatScreen
  user_id?: string;
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
  // Fix: Added properties to resolve TypeScript errors in geminiService and ItemSelectionScreen
  beautyType?: 'lipstick' | 'wig' | 'eyeshadow' | string;
  recommendationVideo?: string;
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
  Generating,
  Result,
  Confirmation,
  BusinessOnboarding,
  MyLooks,
  Rewards,
  ChatList,
  Chat,
  AllHighlights,
  VerificationIntro,
  SplitCamera
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
}

// Fix: Added missing interfaces to resolve compilation errors in multiple screens
export interface SavedLook {
  id: string;
  image: string;
  items: Item[];
  created_at: string;
}

export interface CollaborationPost extends Post {
  brand_id?: string;
  collaboration_status?: 'pending' | 'accepted' | 'declined';
}

export interface InfluencerAffiliationRequest {
  id: string;
  influencer_id: string;
  influencer: Profile;
  brand_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
