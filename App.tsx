
import React from 'react';
// FIX: Changed to a non-type import for Session, which might be required by older Supabase versions.
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, SubCategory, SavedLook, Story, Profile, MarketplaceType, AppNotification, Conversation, Comment, BusinessProfile, CollaborationPost } from './types';
import { generateTryOnImage, normalizeImageAspectRatio, generateBeautyTryOnImage, generateFashionVideo, generateDecorationImage } from './services/geminiService';
import { INITIAL_POSTS, CATEGORIES, INITIAL_STORIES, ITEMS, INITIAL_CONVERSATIONS, INITIAL_COLLABORATION_REQUESTS } from './constants';

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import SettingsScreen from './components/SettingsScreen';
import SubCategorySelectionScreen from './components/SubCategorySelectionScreen';
import ItemSelectionScreen from './components/ItemSelectionScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ResultScreen from './components/ResultScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import FeedScreen from './components/FeedScreen';
import MyLooksScreen from './components/MyLooksScreen';
import CameraScreen from './components/CameraScreen';
import ImageSourceSelectionScreen from './components/ImageSourceSelectionScreen';
import CartScreen from './components/CartScreen';
import RewardsScreen from './components/RewardsScreen';
import GradientButton from './components/GradientButton';
import NotificationsPanel from './components/NotificationsPanel';
import BottomNavBar from './components/BottomNavBar';
import ChatListScreen from './components/ChatListScreen';
import ChatScreen from './components/ChatScreen';
import { XCircleIcon } from './components/IconComponents';
import VideoPlayerModal from './components/VideoPlayerModal';
import AccountTypeSelectionScreen from './components/AccountTypeSelectionScreen';
import BusinessOnboardingScreen from './components/BusinessOnboardingScreen';
import VendorDashboard from './components/VendorDashboard';
import VendorMenuModal from './components/VendorMenuModal';
import VendorAnalyticsScreen from './components/VendorAnalyticsScreen';
import VendorProductsScreen from './components/VendorProductsScreen';
import VendorAffiliatesScreen from './components/VendorAffiliatesScreen';
import VendorCollaborationsScreen from './components/VendorCollaborationsScreen';
import AllHighlightsScreen from './components/AllHighlightsScreen';
import SearchScreen from './components/SearchScreen';
import CommentsModal from './components/CommentsModal';
import PromotionModal from './components/PromotionModal';
import VerificationIntroScreen from './components/VerificationIntroScreen';
import IdUploadScreen from './components/IdUploadScreen';
import FaceScanScreen from './components/FaceScanScreen';
import VerificationPendingScreen from './components/VerificationPendingScreen';
import VeoApiKeyModal from './components/VeoApiKeyModal';
import CaptionModal from './components/CaptionModal';
import CoinBurst from './components/CoinBurst';
import RecommendationModal from './components/RecommendationModal';
import SplitCameraScreen from './components/SplitCameraScreen';
import VideoEditScreen from './components/VideoEditScreen';
import DecorationPlacementScreen from './components/DecorationPlacementScreen';

// Helper para converter data URL para Blob para upload
const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
};

const getCategoryTypeFromItem = (item: Item): MarketplaceType => {
    const rootCategoryId = item.category.split('_')[0];
    const category = CATEGORIES.find(c => c.id === rootCategoryId);
    return category?.type || 'fashion';
};

const SCREENS_WITH_NAVBAR = [Screen.Home, Screen.Feed, Screen.Search, Screen.Cart, Screen.ChatList, Screen.VendorDashboard, Screen.VendorAnalytics, Screen.AllHighlights];

const App: React.FC = () => {
    // Auth & Profile state - Initialized with Dev Data to bypass Auth Tab
    const [session, setSession] = React.useState<Session | null>({ 
        user: { id: 'dev_user_real_space' } 
    } as Session);
    
    const [profile, setProfile] = React.useState<Profile | null>({
        id: 'dev_user_real_space',
        username: 'Novo Utilizador',
        bio: '',
        profile_image_url: null,
        cover_image_url: null,
        account_type: null, // Start at selection screen
        verification_status: 'unverified',
        reward_points: 0
    });

    const [businessProfile, setBusinessProfile] = React.useState<BusinessProfile | null>(null);
    const [authLoading, setAuthLoading] = React.useState(false); // Set to false directly

    // Real Follow System State
    const [followingIds, setFollowingIds] = React.useState<Set<string>>(new Set());
    const [followersCountMap, setFollowersCountMap] = React.useState<Record<string, number>>({});

    // App Navigation and UI state - Starting strictly empty
    const [currentScreen, setCurrentScreen] = React.useState<Screen>(Screen.AccountTypeSelection);
    const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
    const [viewedProfileId, setViewedProfileId] = React.useState<string | null>(null);
    const [userImage, setUserImage] = React.useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = React.useState<string | null>(null);
    const [showVideoPlayer, setShowVideoPlayer] = React.useState(false);
    const [isPublishing, setIsPublishing] = React.useState(false);
    const [imageHistory, setImageHistory] = React.useState<string[]>([]);
    const [navigationStack, setNavigationStack] = React.useState<(Category | SubCategory)[]>([]);
    const [collectionIdentifier, setCollectionIdentifier] = React.useState<{id: string, name: string, type: MarketplaceType} | null>(null);
    const [wornItems, setWornItems] = React.useState<Item[]>([]);
    
    // Core data lists initialized strictly empty for Real Space Mode
    const [posts, setPosts] = React.useState<Post[]>([]);
    const [stories, setStories] = React.useState<Story[]>([]);
    const [savedLooks, setSavedLooks] = React.useState<SavedLook[]>([]);
    const [cartItems, setCartItems] = React.useState<Item[]>([]);
    const [toast, setToast] = React.useState<string | null>(null);
    const [confirmationMessage, setConfirmationMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isCartAnimating, setIsCartAnimating] = React.useState(false);
    const [isVeoKeyFlowNeeded, setIsVeoKeyFlowNeeded] = React.useState(false);
    const [showCoinAnimation, setShowCoinAnimation] = React.useState(false);
    
    // Notifications & Messages State
    const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
    const [showNotificationsPanel, setShowNotificationsPanel] = React.useState(false);
    const [conversations, setConversations] = React.useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
    const [commentingPost, setCommentingPost] = React.useState<Post | null>(null);
    const [isCaptioning, setIsCaptioning] = React.useState(false);
    
    // Vendor State & Promotion State
    const [showVendorMenu, setShowVendorMenu] = React.useState(false);
    const [promotedContent, setPromotedContent] = React.useState<{ items: {id: string, image: string}[] } | null>(null);
    const [collaborationRequests, setCollaborationRequests] = React.useState<CollaborationPost[]>([]);
    const [promotionModalConfig, setPromotionModalConfig] = React.useState<{ isOpen: boolean; accountType: 'personal' | 'business' | null }>({ isOpen: false, accountType: null });
    
    // Verification State
    const [idFrontImage, setIdFrontImage] = React.useState<string | null>(null);
    const [idBackImage, setIdBackImage] = React.useState<string | null>(null);

    // Recommendation State
    const [recommendationItem, setRecommendationItem] = React.useState<Item | null>(null);

    // Split Camera State
    const [splitCameraItem, setSplitCameraItem] = React.useState<Item | null>(null);
    const [editingVideoDetails, setEditingVideoDetails] = React.useState<{ blob: Blob; item: Item } | null>(null);
    
    // Repost & Decoration State
    const [repostingItem, setRepostingItem] = React.useState<Item | null>(null);
    const [placingItem, setPlacingItem] = React.useState<Item | null>(null);

    // Generic Action for Modal Resume
    const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(null);

    const profileImageInputRef = React.useRef(null) as React.MutableRefObject<HTMLInputElement | null>;

    const unreadNotificationCount = notifications.filter(n => !n.read).length;
    const unreadMessagesCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleToggleFollow = (targetId: string) => {
        setFollowingIds(prev => {
            const newSet = new Set(prev);
            const isFollowing = newSet.has(targetId);
            
            if (isFollowing) {
                newSet.delete(targetId);
                setFollowersCountMap(prevMap => ({
                    ...prevMap,
                    [targetId]: Math.max(0, (prevMap[targetId] || 0) - 1)
                }));
                setToast('Deixou de seguir');
            } else {
                newSet.add(targetId);
                setFollowersCountMap(prevMap => ({
                    ...prevMap,
                    [targetId]: (prevMap[targetId] || 0) + 1
                }));
                setToast('Seguindo');
            }
            return newSet;
        });
    };

    const handleSetAccountType = async (type: 'personal' | 'business') => {
        if (!profile) return;
        const updatedProfile = { ...profile, account_type: type };
        setProfile(updatedProfile);
        
        if (type === 'personal') {
            setCurrentScreen(Screen.Feed);
        } else {
            setCurrentScreen(Screen.BusinessOnboarding);
        }
    };
    
    const handleCompleteBusinessOnboarding = (details: Omit<BusinessProfile, 'id'>) => {
        if (!profile) return;
        const newBusinessProfile: BusinessProfile = {
            id: profile.id,
            ...details,
        };
        setBusinessProfile(newBusinessProfile);
        setCurrentScreen(Screen.VendorDashboard);
    };

    const handleSignOut = () => {
        setProfile({
            ...profile!,
            account_type: null
        });
        setViewedProfileId(null);
        setCurrentScreen(Screen.AccountTypeSelection);
    };

    const handleUpdateProfile = async (updates: { username?: string, bio?: string }) => {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        setToast('Perfil atualizado!');
    };
    
    const uploadImage = async (bucket: string, imageDataUrl: string): Promise<string | null> => {
        return imageDataUrl;
    };

    const handleUpdateProfileImage = async (imageDataUrl: string) => {
        setProfile(prev => prev ? { ...prev, profile_image_url: imageDataUrl } : null);
    };
    
    const handleUpdateCoverImage = async (imageDataUrl: string) => {
        setProfile(prev => prev ? { ...prev, cover_image_url: imageDataUrl } : null);
    };

    const handleOpenNotificationsPanel = () => {
        setShowNotificationsPanel(true);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleCloseNotificationsPanel = () => {
        setShowNotificationsPanel(false);
    };

    const handleNotificationClick = (notification: AppNotification) => {
        setShowNotificationsPanel(false);
        if (notification.relatedCategoryId) {
            const category = CATEGORIES.find(c => c.id === notification.relatedCategoryId);
            if (category) {
                handleSelectCategory(category);
            }
        }
    };

    const handleImageUpload = async (imageDataUrl: string) => {
        setUserImage(imageDataUrl);
        setLoadingMessage("IA preparando seu espaço...");
        setIsLoading(true);
        setError(null);
        try {
            const processedImage = imageDataUrl;
            setUserImage(processedImage);
            setGeneratedImage(processedImage);
            setImageHistory([processedImage]);
            setWornItems([]);
            setCurrentScreen(Screen.SubCategorySelection);
        } catch (err: any) {
            setError("Tente novamente.");
            setCurrentScreen(Screen.ImageSourceSelection); 
        } finally {
            setIsLoading(false);
            setLoadingMessage(null);
        }
    };

    const handleSelectCategory = (category: Category) => {
        setNavigationStack([category]);
        if (!userImage && (category.type === 'fashion' || category.type === 'beauty' || category.type === 'decoration')) {
            setCurrentScreen(Screen.ImageSourceSelection);
            return;
        }
        if (category.subCategories && category.subCategories.length > 0) {
            setCurrentScreen(Screen.SubCategorySelection);
        } else {
            setCollectionIdentifier({ id: category.id, name: category.name, type: category.type });
            setCurrentScreen(Screen.ItemSelection);
        }
    };
    
    const handleSelectSubCategory = (subCategory: SubCategory) => {
        if (subCategory.subCategories && subCategory.subCategories.length > 0) {
            setNavigationStack(prev => [...prev, subCategory]);
        } else {
            const rootCategoryId = subCategory.id.split('_')[0];
            const rootCategory = CATEGORIES.find(c => c.id === rootCategoryId);
            setCollectionIdentifier({ id: subCategory.id, name: subCategory.name, type: rootCategory?.type || 'fashion' });
            setCurrentScreen(Screen.ItemSelection);
        }
    };

    const handleBack = () => {
        const newStack = [...navigationStack];
        newStack.pop();
        if (newStack.length === 0) {
            handleNavigateToProfile();
        } else {
            setNavigationStack(newStack);
            setCurrentScreen(Screen.SubCategorySelection);
        }
    };
    
    const handleProfileBack = () => {
        setViewedProfileId(null);
        setCurrentScreen(Screen.Feed);
    };

    const handleItemSelect = async (item: Item) => {
        if (item.recommendationVideo && !recommendationItem) {
            setRecommendationItem(item);
            return;
        }
        const itemType = getCategoryTypeFromItem(item);
        if (itemType === 'decoration') {
            if (!userImage) {
                setError("Carregue uma foto do ambiente.");
                setCurrentScreen(Screen.ImageSourceSelection);
                return;
            }
            setPlacingItem(item);
            setCurrentScreen(Screen.DecorationPlacement);
            return;
        }
        if (itemType === 'fashion' || item.isTryOn) {
            if (!userImage) {
                 if (profile && profile.profile_image_url) setUserImage(profile.profile_image_url);
                 else {
                    setError("Carregue uma foto primeiro.");
                    setCurrentScreen(Screen.ImageSourceSelection);
                    return;
                 }
            }
            const baseImage = generatedImage || userImage!;
            const existingItems = [...wornItems];
            setIsLoading(true);
            setError(null);
            try {
                const generatorFunction = item.isTryOn && itemType === 'beauty' 
                    ? generateBeautyTryOnImage
                    : generateTryOnImage;
                const newImage = await (generatorFunction === generateTryOnImage
                    ? generatorFunction(baseImage, item, existingItems)
                    : (generatorFunction as (userImg: string, newItem: Item) => Promise<string>)(baseImage, item));
                setGeneratedImage(newImage);
                setImageHistory(prev => [...prev, newImage]);
                setWornItems(prevItems => [...prevItems, item]);
                setCurrentScreen(Screen.Result);
            } catch (err: any) {
                setError("Falha ao gerar look.");
                setCurrentScreen(Screen.ItemSelection);
            } finally {
                setIsLoading(false);
            }
        } else {
            setRepostingItem(item);
            setIsCaptioning(true);
        }
    };

    const handleConfirmPlacement = async (compositeImage: string) => {
        setIsLoading(true);
        setLoadingMessage("Ajustando decoração...");
        setError(null);
        try {
            const newImage = await generateDecorationImage(compositeImage);
            setGeneratedImage(newImage);
            setImageHistory(prev => [...prev, newImage]);
            if (placingItem) {
                setWornItems(prevItems => [...prevItems, placingItem]);
            }
            setPlacingItem(null);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError("Erro ao gerar imagem.");
            setCurrentScreen(Screen.DecorationPlacement);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartNewTryOnSession = async (item: Item) => {
        if (!userImage) {
            setCurrentScreen(Screen.ImageSourceSelection);
            return;
        }
        setCollectionIdentifier(null);
        setIsLoading(true);
        setError(null);
        try {
            const newImage = await generateTryOnImage(userImage, item, []);
            setGeneratedImage(newImage);
            setImageHistory([userImage, newImage]);
            setWornItems([item]);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError("Ocorreu um erro.");
            setCurrentScreen(Screen.Cart);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigateToAddMoreItems = () => {
        if (collectionIdentifier) {
            setCurrentScreen(Screen.ItemSelection);
        } else {
            handleBack(); 
        }
    };

    const handleUndoLastItem = () => {
        if (imageHistory.length > 1 && wornItems.length > 0) {
            const newHistory = [...imageHistory];
            newHistory.pop();
            const newWornItems = [...wornItems];
            newWornItems.pop();
            setImageHistory(newHistory);
            setGeneratedImage(newHistory[newHistory.length - 1]);
            setWornItems(newWornItems);
        } else {
             if (collectionIdentifier) setCurrentScreen(Screen.ItemSelection);
             else handleBack();
        }
    };

    const handleGenerateVideo = async () => {
        setIsLoading(true);
        setLoadingMessage("Criando vídeo...");
        setError(null);
        try {
            const videoUrl = await generateFashionVideo(generatedImage!, (message) => {
                setLoadingMessage(message);
            });
            setGeneratedVideoUrl(videoUrl);
            setShowVideoPlayer(true);
        } catch (err: any) {
            setError("Falha ao gerar vídeo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveVideo = () => {
        setToast('Vídeo salvo!');
    };

    const handlePublishVideo = async () => {
        if (!generatedVideoUrl || !profile || !generatedImage) return;
        setShowCoinAnimation(true);
        setProfile(prev => prev ? { ...prev, reward_points: (prev.reward_points || 0) + 50 } : null);
        setTimeout(() => setShowCoinAnimation(false), 2000);
        
        const newPost: Post = {
            id: `post_video_${Date.now()}`,
            user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
            image: generatedImage,
            video: generatedVideoUrl,
            items: wornItems,
            likes: 0,
            isLiked: false,
            comments: [],
            commentCount: 0,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setShowVideoPlayer(false);
        setGeneratedVideoUrl(null);
        setCurrentScreen(Screen.Feed);
        setToast('Postado!');
    };

    const handleUseCamera = () => setCurrentScreen(Screen.Camera);
    const handleStartTryOn = () => {
        setNavigationStack([]);
        setCurrentScreen(Screen.ImageSourceSelection);
    };
    const handleBuy = (item: Item) => {
        setConfirmationMessage(`Pedido de ${item.name} confirmado!`);
        setCurrentScreen(Screen.Confirmation);
    };
    const handleBuyLook = (items: Item[]) => {
        setConfirmationMessage(`Pedido de ${items.length} itens confirmado!`);
        setCurrentScreen(Screen.Confirmation);
    };
    const handleAddToCart = (item: Item) => {
        setCartItems(prevItems => [...prevItems, item]);
        setToast(`${item.name} no carrinho!`);
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 500);
    };

    const handleAddToCartMultiple = (items: Item[]) => {
        if (items.length === 0) return;
        setCartItems(prevItems => [...prevItems, ...items]);
        setToast(`${items.length} itens adicionados!`);
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 500);
    };

    const handleRemoveFromCart = (indexToRemove: number) => {
        setCartItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
    };
    
    const handleNavigateToCart = () => setCurrentScreen(Screen.Cart);
    const handleStartPublishing = () => setIsCaptioning(true);

    const handlePostToFeed = (caption: string) => {
        if (profile) {
            setShowCoinAnimation(true);
            setProfile(prev => prev ? { ...prev, reward_points: (prev.reward_points || 0) + 50 } : null);
            setTimeout(() => setShowCoinAnimation(false), 2000);
            let newPost: Post;
            if (repostingItem) {
                 newPost = {
                    id: `post_${Date.now()}`,
                    user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
                    image: repostingItem.image,
                    items: [repostingItem],
                    likes: 0,
                    isLiked: false,
                    comments: [],
                    commentCount: 0,
                    caption: caption,
                };
                setRepostingItem(null);
            } else if (generatedImage) {
                 newPost = {
                    id: `post_${Date.now()}`,
                    user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
                    image: generatedImage,
                    items: wornItems,
                    likes: 0,
                    isLiked: false,
                    comments: [],
                    commentCount: 0,
                    caption: caption,
                };
            } else return;
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setIsCaptioning(false);
            setConfirmationMessage("Publicado!");
            setCurrentScreen(Screen.Confirmation);
        }
    };

    const handleSaveLook = async () => {
        if (!generatedImage || wornItems.length === 0 || !profile) return;
        const newLook: SavedLook = { id: `look_${Date.now()}`, image: generatedImage, items: wornItems };
        setSavedLooks(prevLooks => [newLook, ...prevLooks]);
        setConfirmationMessage('Espaço configurado!');
        setCurrentScreen(Screen.Confirmation);
    };

    const handlePostLookFromSaved = (look: SavedLook) => {
        if (!profile) return;
        const newPost: Post = {
            id: `post_${Date.now()}`,
            user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
            image: look.image,
            items: look.items,
            likes: 0,
            isLiked: false,
            comments: [],
            commentCount: 0,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setToast('Publicado!');
        setCurrentScreen(Screen.Feed);
        setShowCoinAnimation(true);
        setProfile(prev => prev ? { ...prev, reward_points: (prev.reward_points || 0) + 50 } : null);
        setTimeout(() => setShowCoinAnimation(false), 2000);
    };

    const handleSaveImage = () => {
        setToast('Imagem guardada!');
    };

    const handleItemClick = (item: Item) => {
        const parentCategoryId = item.category.split('_')[0];
        const parentCategory = CATEGORIES.find(c => c.id === parentCategoryId);
        if (parentCategory) {
            setWornItems([]);
            if (userImage) setGeneratedImage(userImage);
            handleSelectCategory(parentCategory);
        }
    };

    const handleLikePost = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p));
    };

    const handleAddComment = (postId: string, text: string) => {
        if (!profile) return;
        const newComment: Comment = {
            id: `comment_${Date.now()}`,
            user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
            text,
            timestamp: new Date().toISOString()
        };
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 } : p));
    };
    
    const handleOpenComments = (postId: string) => {
        const post = posts.find(p => p.id === postId);
        if (post) setCommentingPost(post);
    };

    const resetToHome = () => {
        const fromPublication = confirmationMessage.toLowerCase().includes('publicado');
        const fromVerification = confirmationMessage.toLowerCase().includes('verificado');
        setGeneratedImage(userImage);
        setWornItems([]);
        setImageHistory(userImage ? [userImage] : []);
        setNavigationStack([]);
        setCollectionIdentifier(null);
        if (fromPublication) setCurrentScreen(Screen.Feed);
        else if (fromVerification) setCurrentScreen(Screen.Settings);
        else handleNavigateToProfile();
    };

    const handleOpenSplitCamera = (item: Item) => {
        setSplitCameraItem(item);
        setCurrentScreen(Screen.SplitCamera);
    };

    const handleRecordingComplete = (videoBlob: Blob) => {
        if (splitCameraItem) {
            setEditingVideoDetails({ blob: videoBlob, item: splitCameraItem });
            setCurrentScreen(Screen.VideoEdit);
        }
    };
    
    const handlePublishOverlayVideo = (details: { caption: string; position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
        if (profile && editingVideoDetails) {
            const { blob, item } = editingVideoDetails;
            const newPost: Post = {
                id: `post_overlay_${Date.now()}`,
                user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
                image: item.image,
                video: URL.createObjectURL(blob),
                items: [item],
                likes: 0,
                isLiked: false,
                comments: [],
                commentCount: 0,
                caption: details.caption,
                layout: 'product-overlay',
                overlayPosition: details.position,
            };
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setConfirmationMessage('Publicado!');
            setCurrentScreen(Screen.Confirmation);
            setShowCoinAnimation(true);
            setProfile(prev => prev ? { ...prev, reward_points: (prev.reward_points || 0) + 50 } : null);
            setTimeout(() => setShowCoinAnimation(false), 2000);
        }
        setSplitCameraItem(null);
        setEditingVideoDetails(null);
    };

    const handleNavigateToMyLooks = () => setCurrentScreen(Screen.MyLooks);
    const handleNavigateToRewards = () => setCurrentScreen(Screen.Rewards);
    const handleNavigateToSettings = () => setCurrentScreen(Screen.Settings);
    const handleNavigateToSearch = () => setCurrentScreen(Screen.Search);
    const handleNavigateToChat = () => setCurrentScreen(Screen.ChatList);
    const handleNavigateToAllHighlights = () => setCurrentScreen(Screen.AllHighlights);

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c));
        setCurrentScreen(Screen.Chat);
    };

    const handleSendMessage = (text: string, conversationId: string) => {
        const newMessage = { id: `msg_${Date.now()}`, text, senderId: profile!.id, timestamp: new Date().toISOString() };
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, lastMessage: newMessage } : c));
    };

    const handleNavigateToProfile = () => {
        setViewedProfileId(null);
        if (profile?.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
        else setCurrentScreen(Screen.Home);
    };
    
    const handleNavigateToVendorAnalytics = () => setCurrentScreen(Screen.VendorAnalytics);
    const handleNavigateToVendorCollaborations = () => setCurrentScreen(Screen.VendorCollaborations);

    const handleViewProfile = async (profileId: string) => {
        if (profileId === profile?.id) { handleNavigateToProfile(); return; }
        setViewedProfileId(profileId);
        setCurrentScreen(Screen.Home);
    };

    const handleOpenPromotionModal = (type: 'personal' | 'business') => setPromotionModalConfig({ isOpen: true, accountType: type });
    const handleClosePromotionModal = () => setPromotionModalConfig({ isOpen: false, accountType: null });

    const handleConfirmPromotion = (details: { budget: number; duration: number; items: { id: string; image: string; }[]; }) => {
        if (promotionModalConfig.accountType === 'business') {
            setPromotedContent({ items: details.items });
            setToast(`Promoção ativada!`);
        } else if (promotionModalConfig.accountType === 'personal') {
            const postIds = new Set(details.items.map(item => item.id));
            setPosts(prev => prev.map(p => postIds.has(p.id) ? { ...p, isSponsored: true } : p));
            setToast(`Espaço promovido!`);
        }
        handleClosePromotionModal();
    };

    const handleApproveCollaboration = (requestId: string) => {
        if (!businessProfile) return;
        const request = collaborationRequests.find(r => r.id === requestId);
        if (!request) return;
        setPosts(prev => prev.map(p => p.id === request.postId ? { ...p, user: { id: businessProfile.id, name: businessProfile.business_name, avatar: businessProfile.logo_url } } : p));
        setCollaborationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
        setToast('Colaboração ativa!');
    };
    
    const handleSponsorPost = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSponsored: true } : p));
        setToast('Patrocinado!');
    };

    const handleNavigateToVerification = () => {
        if (profile?.verification_status === 'unverified') setCurrentScreen(Screen.VerificationIntro);
        else setToast(profile?.verification_status === 'verified' ? 'Já verificado.' : 'Em análise.');
    };
    
    const handleIdUploadComplete = (idFront: string, idBack: string) => {
        setIdFrontImage(idFront); setIdBackImage(idBack);
        setCurrentScreen(Screen.FaceScan);
    };

    const handleFaceScanComplete = () => {
        if (profile) setProfile({ ...profile, verification_status: 'pending' });
        setCurrentScreen(Screen.VerificationPending);
    };

    const handleVerificationComplete = () => {
        if (profile) setProfile({ ...profile, verification_status: 'verified' });
        setConfirmationMessage('Perfil verificado!');
        setCurrentScreen(Screen.Confirmation);
    };

    const renderScreen = () => {
        if (isLoading) return <LoadingIndicator userImage={userImage || ''} customMessage={loadingMessage} />;
        const currentNode = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;
        switch (currentScreen) {
             case Screen.DecorationPlacement:
                if (userImage && placingItem) return <DecorationPlacementScreen userImage={userImage} item={placingItem} onBack={() => { setPlacingItem(null); setCurrentScreen(Screen.ItemSelection); }} onConfirm={handleConfirmPlacement} />;
                setCurrentScreen(Screen.ItemSelection); return null;
             case Screen.SplitCamera:
                if (splitCameraItem) return <SplitCameraScreen item={splitCameraItem} onBack={() => setCurrentScreen(Screen.ItemSelection)} onRecordingComplete={handleRecordingComplete} />;
                setCurrentScreen(Screen.ItemSelection); return null;
            case Screen.VideoEdit:
                if (editingVideoDetails) return <VideoEditScreen videoBlob={editingVideoDetails.blob} item={editingVideoDetails.item} onBack={() => { setEditingVideoDetails(null); setCurrentScreen(Screen.SplitCamera); }} onPublish={handlePublishOverlayVideo} isPublishing={isPublishing} />;
                setCurrentScreen(Screen.ItemSelection); return null;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={handleSetAccountType} />;
            case Screen.BusinessOnboarding: return <BusinessOnboardingScreen onComplete={handleCompleteBusinessOnboarding} />;
            case Screen.VendorDashboard:
                if (businessProfile) return <VendorDashboard businessProfile={businessProfile} onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={unreadNotificationCount} onOpenNotificationsPanel={handleOpenNotificationsPanel} onOpenPromotionModal={() => handleOpenPromotionModal('business')} followersCount={followersCountMap[businessProfile.id] || 0} followingCount={0} />;
                setCurrentScreen(Screen.BusinessOnboarding); return null;
            case Screen.VendorAnalytics: return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} isProfilePromoted={!!promotedContent} />;
            case Screen.VendorProducts: if (businessProfile) return <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile} />;
                setCurrentScreen(Screen.VendorDashboard); return null;
            case Screen.VendorAffiliates: return <VendorAffiliatesScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
             case Screen.VendorCollaborations: return <VendorCollaborationsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} collaborationRequests={collaborationRequests} posts={posts} onApprove={handleApproveCollaboration} onReject={(id) => setCollaborationRequests(prev => prev.map(r => r.id === id ? {...r, status: 'rejected'} : r))} onSponsor={handleSponsorPost} />;
            case Screen.Home: return <HomeScreen loggedInProfile={profile!} viewedProfileId={viewedProfileId} onUpdateProfileImage={handleUpdateProfileImage} onUpdateProfile={handleUpdateProfile} onSelectCategory={handleSelectCategory} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={handleNavigateToMyLooks} onNavigateToCart={handleNavigateToCart} onNavigateToChat={handleNavigateToChat} onNavigateToSettings={handleNavigateToSettings} onNavigateToRewards={handleNavigateToRewards} onStartTryOn={handleStartTryOn} onSignOut={handleSignOut} isCartAnimating={isCartAnimating} onBack={handleProfileBack} posts={posts} onItemClick={handleItemClick} onViewProfile={handleViewProfile} unreadNotificationCount={unreadNotificationCount} unreadMessagesCount={unreadMessagesCount} onOpenNotificationsPanel={handleOpenNotificationsPanel} isFollowing={viewedProfileId ? followingIds.has(viewedProfileId) : false} onToggleFollow={handleToggleFollow} followersCount={viewedProfileId ? followersCountMap[viewedProfileId] || 0 : 0} followingCount={!viewedProfileId ? followingIds.size : 0} />;
            case Screen.Settings: return <SettingsScreen profile={profile!} onBack={handleNavigateToProfile} theme={theme} onToggleTheme={toggleTheme} onNavigateToVerification={handleNavigateToVerification} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={handleImageUpload} onUseCamera={handleUseCamera} onBack={handleNavigateToProfile} />;
            case Screen.SubCategorySelection: if (currentNode) return <SubCategorySelectionScreen node={currentNode} onSelectSubCategory={handleSelectSubCategory} onBack={handleBack} />;
                 handleNavigateToProfile(); return null;
            case Screen.ItemSelection: if (collectionIdentifier) { const displayImage = userImage || (profile?.profile_image_url || ''); return <ItemSelectionScreen userImage={displayImage} collectionId={collectionIdentifier.id} collectionName={collectionIdentifier.name} collectionType={collectionIdentifier.type} onItemSelect={handleItemSelect} onOpenSplitCamera={handleOpenSplitCamera} onBack={() => setCurrentScreen(Screen.SubCategorySelection)} onBuy={handleBuy} onAddToCart={handleAddToCart} />; }
                handleNavigateToProfile(); return null;
            case Screen.Camera: return <CameraScreen onPhotoTaken={handleImageUpload} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.Result: if (generatedImage && collectionIdentifier) { const categoryItems = ITEMS.filter(item => item.category.startsWith(collectionIdentifier.id.split('_')[0])); return <ResultScreen generatedImage={generatedImage} items={wornItems} categoryItems={categoryItems} onBuy={handleBuyLook} onUndo={handleUndoLastItem} onStartPublishing={handleStartPublishing} onSaveImage={handleSaveImage} onItemSelect={handleItemSelect} onAddMoreItems={handleNavigateToAddMoreItems} onGenerateVideo={handleGenerateVideo} />; }
                setCurrentScreen(Screen.Home); return null;
            case Screen.Confirmation: return <ConfirmationScreen message={confirmationMessage} onHome={resetToHome} />;
            case Screen.Feed: return <FeedScreen posts={posts} stories={stories} profile={profile!} businessProfile={businessProfile} isProfilePromoted={!!promotedContent} promotedItems={promotedContent?.items || []} onBack={handleNavigateToProfile} onItemClick={handleItemClick} onAddToCartMultiple={handleAddToCartMultiple} onBuyMultiple={handleBuyLook} onViewProfile={handleViewProfile} onSelectCategory={handleSelectCategory} onLikePost={handleLikePost} onAddComment={handleAddComment} onNavigateToAllHighlights={handleNavigateToAllHighlights} onStartCreate={handleStartTryOn} unreadNotificationCount={unreadNotificationCount} onNotificationsClick={handleOpenNotificationsPanel} onSearchClick={handleNavigateToSearch} />;
            case Screen.MyLooks: return <MyLooksScreen looks={savedLooks} onBack={handleNavigateToProfile} onItemClick={handleItemClick} onBuyLook={handleBuyLook} onPostLook={handlePostLookFromSaved} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={handleNavigateToProfile} onRemoveItem={handleRemoveFromCart} onBuyItem={(item) => handleBuy(item)} onTryOnItem={handleStartNewTryOnSession} onCheckout={() => handleBuyLook(cartItems)} />;
            case Screen.Rewards: return <RewardsScreen onBack={handleNavigateToProfile} points={profile?.reward_points || 0} />;
            case Screen.ChatList: return <ChatListScreen conversations={conversations} onBack={handleNavigateToProfile} onSelectConversation={handleSelectConversation} />;
            case Screen.Chat: if (selectedConversation) return <ChatScreen conversation={selectedConversation} currentUser={profile!} onBack={() => setCurrentScreen(Screen.ChatList)} onSendMessage={handleSendMessage} />;
                setCurrentScreen(Screen.ChatList); return null;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={ITEMS} onViewProfile={handleViewProfile} onLikePost={handleLikePost} onItemClick={handleItemClick} onItemAction={handleItemSelect} onOpenSplitCamera={handleOpenSplitCamera} onOpenComments={handleOpenComments} onAddToCart={handleAddToCart} onBuy={handleBuy} />;
            case Screen.AllHighlights: return <AllHighlightsScreen categories={CATEGORIES} onBack={() => setCurrentScreen(Screen.Feed)} onSelectCategory={handleSelectCategory} />;
            case Screen.VerificationIntro: return <VerificationIntroScreen onBack={() => setCurrentScreen(Screen.Settings)} onStart={() => setCurrentScreen(Screen.IdUpload)} />;
            case Screen.IdUpload: return <IdUploadScreen onBack={() => setCurrentScreen(Screen.VerificationIntro)} onComplete={handleIdUploadComplete} />;
            case Screen.FaceScan: return <FaceScanScreen onBack={() => setCurrentScreen(Screen.IdUpload)} onComplete={handleFaceScanComplete} />;
            case Screen.VerificationPending: return <VerificationPendingScreen onComplete={handleVerificationComplete} />;
            default: setCurrentScreen(Screen.Feed); return null;
        }
    };

    if (authLoading) return <SplashScreen />;
    if (!profile) return ( <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--bg-main)] text-amber-400 p-6 text-center"> <p className="mb-4">Configurando seu Espaço Real...</p> </div> );
    
    const showNavBar = SCREENS_WITH_NAVBAR.includes(currentScreen) || (profile.account_type === 'business' && [Screen.VendorDashboard, Screen.VendorAnalytics].includes(currentScreen));

    return (
        <div className="h-full w-full max-w-lg mx-auto bg-[var(--bg-main)] flex flex-col relative font-sans">
            <div className="flex-grow overflow-hidden relative">{renderScreen()}</div>
            {showNavBar && ( <div className="flex-shrink-0"> <BottomNavBar activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={handleNavigateToCart} onNavigateToPromotion={() => handleOpenPromotionModal(profile!.account_type!)} onNavigateToProfile={handleNavigateToProfile} onStartTryOn={handleStartTryOn} isCartAnimating={isCartAnimating} accountType={profile.account_type} onNavigateToVendorAnalytics={handleNavigateToVendorAnalytics} /> </div> )}
            {toast && ( <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm animate-fadeIn z-50"> {toast} </div> )}
            {error && ( <div className="absolute top-0 left-0 right-0 p-3 bg-red-500/90 text-white text-sm flex justify-between items-center z-50"> <span>{error}</span> <button onClick={() => setError(null)}><XCircleIcon className="w-5 h-5"/></button> </div> )}
            {showCoinAnimation && <CoinBurst />}
            {showNotificationsPanel && ( <NotificationsPanel notifications={notifications} onClose={handleCloseNotificationsPanel} onNotificationClick={handleNotificationClick} /> )}
            {showVideoPlayer && generatedVideoUrl && ( <VideoPlayerModal videoUrl={generatedVideoUrl} onClose={() => setShowVideoPlayer(false)} onPublish={handlePublishVideo} onSave={handleSaveVideo} isPublishing={isPublishing} /> )}
            {isVeoKeyFlowNeeded && (window as any).aistudio && ( <VeoApiKeyModal onClose={() => setIsVeoKeyFlowNeeded(false)} onSelectKey={async () => { await (window as any).aistudio.openSelectKey(); setIsVeoKeyFlowNeeded(false); if (pendingAction) { setTimeout(() => { pendingAction(); setPendingAction(null); }, 100); } else { setTimeout(() => { handleGenerateVideo(); }, 100); } }} /> )}
            {showVendorMenu && ( <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => { setCurrentScreen(Screen.VendorAffiliates); setShowVendorMenu(false); }} onNavigateToCollaborations={() => { setCurrentScreen(Screen.VendorCollaborations); setShowVendorMenu(false); }} onSignOut={handleSignOut} /> )}
            {commentingPost && profile && ( <CommentsModal post={commentingPost} currentUser={profile} onClose={() => setCommentingPost(null)} onAddComment={handleAddComment} /> )}
            {promotionModalConfig.isOpen && ( <PromotionModal accountType={promotionModalConfig.accountType!} profile={promotionModalConfig.accountType === 'business' ? businessProfile! : profile} userPosts={posts.filter(p => p.user.id === profile?.id)} onClose={handleClosePromotionModal} onConfirm={handleConfirmPromotion} /> )}
            {isCaptioning && (generatedImage || repostingItem) && ( <CaptionModal image={repostingItem ? repostingItem.image : generatedImage!} onClose={() => { setIsCaptioning(false); setRepostingItem(null); }} onPublish={handlePostToFeed} /> )}
            {recommendationItem && ( <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={(item) => { handleAddToCart(item); setRecommendationItem(null); }} onStartTryOn={(item) => { setRecommendationItem(null); setTimeout(() => { if (!userImage) setCurrentScreen(Screen.ImageSourceSelection); else handleItemSelect(item); }, 100); }} /> )}
        </div>
    );
};

export default App;
