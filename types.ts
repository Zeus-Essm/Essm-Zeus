
export type MarketplaceType =
  | 'fashion'
  | 'restaurant'
  | 'supermarket'
  | 'beauty'
  | 'technology'
  | 'decoration';

/* ======================
   USER / PROFILE (Supabase Schema)
====================== */

export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Profile {
  user_id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  account_type: 'personal' | 'business' | null;
  verification_status?: 'unverified' | 'pending' | 'verified';
  reward_points?: number;
}

/* ======================
   CATALOG / VENDOR (Supabase Schema)
====================== */

export interface Folder {
  id: string;
  owner_id: string;
  title: string;
  cover_image: string | null;
  item_count: number;
  created_at: string;
}

export interface Product {
  id: string;
  owner_id: string;
  folder_id: string | null;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
}

export interface ShowcaseItem {
  id: string;
  owner_id: string;
  title: string;
  image_url: string;
  created_at?: string;
}

/* ======================
   FEED / TRY-ON (UI Model)
====================== */

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;

  // opcionais (uso em feed / try-on)
  isTryOn?: boolean;
  beautyType?: 'lipstick' | 'wig' | 'eyeshadow';
  gender?: 'male' | 'female' | 'kid' | 'unisex';

  // ligação com vendedor
  vendorSubCategory?: string;
  recommendationVideo?: string;
  folder_id?: string | null;
  owner_id?: string;
}

/* ======================
   SOCIAL
====================== */

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
}

export interface Post {
  id: string;
  user: User;
  image: string;
  video?: string;
  items: Item[];
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  commentCount: number;
  isSponsored?: boolean;
  caption?: string;
  layout?: 'product-overlay';
  overlayPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface Story {
  id: string;
  user: { full_name: string | null; avatar_url: string | null };
  backgroundImage: string;
}

/* ======================
   COMMUNICATION
====================== */

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
}

/* ======================
   UI NAVIGATION
====================== */

export enum Screen {
  Splash,
  Login,
  AccountTypeSelection,
  BusinessOnboarding,
  VendorDashboard,
  VendorAnalytics,
  VendorProducts,
  VendorAffiliates,
  VendorCollaborations,
  Home,
  Settings,
  ImageSourceSelection,
  Camera,
  SubCategorySelection,
  ItemSelection,
  Generating,
  Result,
  Confirmation,
  Feed,
  MyLooks,
  Cart,
  Rewards,
  ChatList,
  Chat,
  Search,
  AllHighlights,
  VerificationIntro,
  IdUpload,
  FaceScan,
  VerificationPending,
  SplitCamera,
  VideoEdit,
  DecorationPlacement
}

export interface SavedLook {
  id: string;
  image: string;
  items: Item[];
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

export interface InfluencerAffiliationRequest {
  id: string;
  influencer: {
    id: string;
    name: string;
    avatar: string;
    followers: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface CollaborationPost {
  id: string;
  influencer: {
    id: string;
    name: string;
    avatar: string;
  };
  businessId: string;
  postId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
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
