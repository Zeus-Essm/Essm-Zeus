
import React from 'react';
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

const getOrCreateProfile = async (session: Session, setError: (msg: string) => void): Promise<Profile | null> => {
    try {
        const user = session.user;
        const meta = user.user_metadata || {};
        const fallbackName = meta.full_name || meta.name || user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.error("Supabase profile fetch error:", error);
            return {
                id: user.id,
                username: fallbackName,
                profile_image_url: null,
                bio: '',
                cover_image_url: '',
                account_type: null,
                verification_status: 'unverified',
                reward_points: 0
            };
        }

        if (data) {
            return {
                id: data.id,
                username: data.username || fallbackName,
                profile_image_url: data.profile_image_url || null,
                bio: data.bio || '',
                cover_image_url: data.cover_image_url || '',
                account_type: data.account_type || null,
                verification_status: data.verification_status || 'unverified',
                reward_points: data.reward_points || 0
            };
        }

        return {
            id: user.id,
            username: fallbackName,
            profile_image_url: null,
            bio: '',
            cover_image_url: '',
            account_type: null,
            verification_status: 'unverified',
            reward_points: 0
        };
    } catch (err: any) {
        console.error("Critical error in getOrCreateProfile:", err.message);
        return null;
    }
};

const getCategoryTypeFromItem = (item: Item): MarketplaceType => {
    const rootCategoryId = item.category.split('_')[0];
    const category = CATEGORIES.find(c => c.id === rootCategoryId);
    return category?.type || 'fashion';
};

const SCREENS_WITH_NAVBAR = [Screen.Home, Screen.Feed, Screen.Search, Screen.Cart, Screen.ChatList, Screen.VendorDashboard, Screen.VendorAnalytics, Screen.AllHighlights];

const App: React.FC = () => {
    const [session, setSession] = React.useState<Session | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [businessProfile, setBusinessProfile] = React.useState<BusinessProfile | null>(null);
    const [authLoading, setAuthLoading] = React.useState(true);

    const [currentScreen, setCurrentScreen] = React.useState<Screen>(Screen.Home);
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
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
    const [posts, setPosts] = React.useState<Post[]>(INITIAL_POSTS);
    const [stories, setStories] = React.useState<Story[]>(INITIAL_STORIES);
    const [savedLooks, setSavedLooks] = React.useState<SavedLook[]>([]);
    const [cartItems, setItemCart] = React.useState<Item[]>([]);
    const [toast, setToast] = React.useState<string | null>(null);
    const [confirmationMessage, setConfirmationMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isCartAnimating, setIsCartAnimating] = React.useState(false);
    const [isPreviewingAsVisitor, setIsPreviewingAsVisitor] = React.useState(false);
    const [isVeoKeyFlowNeeded, setIsVeoKeyFlowNeeded] = React.useState(false);
    const [showCoinAnimation, setShowCoinAnimation] = React.useState(false);
    
    const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
    const [showNotificationsPanel, setShowNotificationsPanel] = React.useState(false);
    const [conversations, setConversations] = React.useState<Conversation[]>(INITIAL_CONVERSATIONS);
    const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
    const [commentingPost, setCommentingPost] = React.useState<Post | null>(null);
    const [isCaptioning, setIsCaptioning] = React.useState(false);
    
    const [showVendorMenu, setShowVendorMenu] = React.useState(false);
    const [promotedContent, setPromotedContent] = React.useState<{ items: {id: string, image: string}[] } | null>(null);
    const [collaborationRequests, setCollaborationRequests] = React.useState<CollaborationPost[]>(INITIAL_COLLABORATION_REQUESTS);
    const [promotionModalConfig, setPromotionModalConfig] = React.useState<{ isOpen: boolean; accountType: 'personal' | 'business' | null }>({ isOpen: false, accountType: null });
    
    const [idFrontImage, setIdFrontImage] = React.useState<string | null>(null);
    const [idBackImage, setIdBackImage] = React.useState<string | null>(null);

    const [recommendationItem, setRecommendationItem] = React.useState<Item | null>(null);
    const [splitCameraItem, setSplitCameraItem] = React.useState<Item | null>(null);
    const [editingVideoDetails, setEditingVideoDetails] = React.useState<{ blob: Blob; item: Item } | null>(null);
    const [repostingItem, setRepostingItem] = React.useState<Item | null>(null);
    const [placingItem, setPlacingItem] = React.useState<Item | null>(null);
    const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(null);

    const unreadNotificationCount = notifications.filter(n => !n.read).length;
    const unreadMessagesCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    React.useEffect(() => {
        const fetchAndSetUserData = async (session: Session) => {
            const profileData = await getOrCreateProfile(session, setError);
            setProfile(profileData);

            if (profileData) {
                if (!profileData.account_type) {
                    setCurrentScreen(Screen.AccountTypeSelection);
                } else if (profileData.account_type === 'business') {
                    setBusinessProfile({
                        id: profileData.id,
                        business_name: profileData.username,
                        logo_url: profileData.profile_image_url || '',
                        business_category: 'Fashion',
                        description: profileData.bio || ''
                    });
                    setCurrentScreen(Screen.VendorDashboard);
                } else {
                    setCurrentScreen(Screen.Feed);
                }
            }
            setAuthLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setAuthLoading(true);
                setSession(session);
                await fetchAndSetUserData(session);
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setProfile(null);
                setBusinessProfile(null);
                setCurrentScreen(Screen.Login);
                setAuthLoading(false);
            } else if (event === 'INITIAL_SESSION') {
                setSession(session);
                if (session) {
                    await fetchAndSetUserData(session);
                } else {
                    setAuthLoading(false);
                }
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    const handleSetAccountType = async (type: 'personal' | 'business') => {
        if (!profile || !session) return;
        const updatedProfile = { ...profile, account_type: type };
        setProfile(updatedProfile);

        try {
            await supabase.from('profiles').update({ account_type: type }).eq('id', session.user.id);
        } catch (err) {}
        
        if (type === 'personal') {
            setCurrentScreen(Screen.Feed);
        } else {
            setCurrentScreen(Screen.BusinessOnboarding);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const handleUpdateProfile = async (updates: { username?: string, bio?: string }) => {
        if (!session) return;
        try {
            const { data } = await supabase.from('profiles').update(updates).eq('id', session.user.id).select().maybeSingle();
            if (data) setProfile({ ...profile!, ...data });
            setToast('Perfil atualizado!');
        } catch (err: any) {}
    };

    const handleImageUpload = async (imageDataUrl: string) => {
        setUserImage(imageDataUrl);
        setIsLoading(true);
        try {
            const processedImage = await normalizeImageAspectRatio(imageDataUrl);
            setUserImage(processedImage);
            setGeneratedImage(processedImage);
            setImageHistory([processedImage]); 
            setWornItems([]);
            setCurrentScreen(Screen.SubCategorySelection);
        } catch (err: any) {
            setCurrentScreen(Screen.ImageSourceSelection); 
        } finally {
            setIsLoading(false);
        }
    };

    const renderScreen = () => {
        if (isLoading) return <LoadingIndicator userImage={userImage || ''} />;
        const currentNode = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;
        switch (currentScreen) {
            case Screen.AccountTypeSelection:
                return <AccountTypeSelectionScreen onSelect={handleSetAccountType} />;
            case Screen.BusinessOnboarding:
                return <BusinessOnboardingScreen onComplete={(details) => {
                    setBusinessProfile({ id: profile!.id, ...details });
                    setCurrentScreen(Screen.VendorDashboard);
                }} />;
            case Screen.VendorDashboard:
                return businessProfile ? <VendorDashboard businessProfile={businessProfile} onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={unreadNotificationCount} onOpenNotificationsPanel={() => setShowNotificationsPanel(true)} onOpenPromotionModal={() => {}} /> : null;
            case Screen.Home:
                return <HomeScreen loggedInProfile={profile!} viewedProfileId={viewedProfileId} onUpdateProfileImage={() => {}} onUpdateProfile={handleUpdateProfile} onSelectCategory={(c) => { setNavigationStack([c]); setCurrentScreen(Screen.SubCategorySelection); }} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => setCurrentScreen(Screen.MyLooks)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => setCurrentScreen(Screen.ChatList)} onNavigateToSettings={() => setCurrentScreen(Screen.Settings)} onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} onSignOut={handleSignOut} isCartAnimating={isCartAnimating} onBack={() => setViewedProfileId(null)} isPreviewingAsVisitor={false} onToggleVisitorPreview={() => {}} posts={posts} onItemClick={() => {}} onViewProfile={setViewedProfileId} unreadNotificationCount={unreadNotificationCount} unreadMessagesCount={unreadMessagesCount} onOpenNotificationsPanel={() => setShowNotificationsPanel(true)} />;
            case Screen.ImageSourceSelection:
                 return <ImageSourceSelectionScreen onImageUpload={handleImageUpload} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(Screen.Home)} />;
            case Screen.Feed:
                return <FeedScreen posts={posts} stories={stories} profile={profile!} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={() => {}} onAddToCartMultiple={() => {}} onBuyMultiple={() => {}} onViewProfile={setViewedProfileId} onSelectCategory={(c) => { setNavigationStack([c]); setCurrentScreen(Screen.SubCategorySelection); }} onLikePost={() => {}} onAddComment={() => {}} onNavigateToAllHighlights={() => {}} unreadNotificationCount={unreadNotificationCount} onNotificationsClick={() => setShowNotificationsPanel(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Login:
                return <LoginScreen onContinueAsVisitor={() => {}} />;
            default:
                return <HomeScreen loggedInProfile={profile!} viewedProfileId={null} onUpdateProfileImage={() => {}} onUpdateProfile={handleUpdateProfile} onSelectCategory={(c) => { setNavigationStack([c]); setCurrentScreen(Screen.SubCategorySelection); }} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => setCurrentScreen(Screen.MyLooks)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => setCurrentScreen(Screen.ChatList)} onNavigateToSettings={() => setCurrentScreen(Screen.Settings)} onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} onSignOut={handleSignOut} isCartAnimating={isCartAnimating} onBack={() => {}} isPreviewingAsVisitor={false} onToggleVisitorPreview={() => {}} posts={posts} onItemClick={() => {}} onViewProfile={setViewedProfileId} unreadNotificationCount={unreadNotificationCount} unreadMessagesCount={unreadMessagesCount} onOpenNotificationsPanel={() => setShowNotificationsPanel(true)} />;
        }
    };

    if (authLoading) return <SplashScreen />;
    if (!session) return <LoginScreen onContinueAsVisitor={() => {}} />;
    if (!profile) return <div className="h-full flex items-center justify-center bg-black text-red-500 font-bold uppercase tracking-tighter">Sincronizando Perfil...</div>;
    
    const showNavBar = SCREENS_WITH_NAVBAR.includes(currentScreen);

    return (
        <div className="h-full w-full max-w-lg mx-auto bg-[var(--bg-main)] flex flex-col relative font-sans">
            <div className="flex-grow overflow-hidden relative">{renderScreen()}</div>
            {showNavBar && <BottomNavBar activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => {}} onNavigateToProfile={() => setCurrentScreen(Screen.Home)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={isCartAnimating} accountType={profile.account_type} onNavigateToVendorAnalytics={() => {}} />}
            {toast && <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm z-50">Update Confirmado ✅</div>}
        </div>
    );
};

export default App;
