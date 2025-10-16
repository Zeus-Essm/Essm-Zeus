

export type MarketplaceType = 'fashion' | 'restaurant' | 'supermarket' | 'beauty' | 'technology';

export interface User {
  id: string;
  name: string;
  avatar: string;
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

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  isTryOn?: boolean;
  beautyType?: 'lipstick' | 'wig' | 'eyeshadow';
  gender?: 'male' | 'female' | 'kid' | 'unisex';
  vendorSubCategory?: string;
}

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
}

export interface Story {
  id: string;
  user: { name: string; avatar: string };
  backgroundImage: string;
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
    lastMessage: Message;
    unreadCount: number;
}

export interface SavedLook {
    id: string;
    image: string;
    items: Item[];
}

export interface Profile {
  id: string;
  username: string;
  bio: string | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  account_type: 'personal' | 'business' | null;
  verification_status?: 'unverified' | 'pending' | 'verified';
  reward_points?: number;
}

export interface BusinessProfile {
    id: string;
    business_name: string;
    business_category: string;
    description: string;
    logo_url: string;
}

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
  VerificationPending
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