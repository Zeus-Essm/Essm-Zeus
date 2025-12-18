
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
    // Auth & Profile state
    const [session, setSession] = React.useState<Session | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [authLoading, setAuthLoading] = React.useState(true);

    // Real Follow System State
    const [followingIds, setFollowingIds] = React.useState<Set<string>>(new Set());
    const [followersCountMap, setFollowersCountMap] = React.useState<Record<string, number>>({});

    // App Navigation and UI state
    const [currentScreen, setCurrentScreen] = React.useState<Screen>(Screen.Login);
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
    const [cartItems, setCartItems] = React.useState<Item[]>([]);
    const [toast, setToast] = React.useState<string | null>(null);
    const [confirmationMessage, setConfirmationMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isCartAnimating, setIsCartAnimating] = React.useState(false);
    const [isVeoKeyFlowNeeded, setIsVeoKeyFlowNeeded] = React.useState(false);
    const [showCoinAnimation, setShowCoinAnimation] = React.useState(false);
    
    const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
    const [showNotificationsPanel, setShowNotificationsPanel] = React.useState(false);
    const [conversations, setConversations] = React.useState<Conversation[]>(INITIAL_CONVERSATIONS);
    const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
    const [commentingPost, setCommentingPost] = React.useState<Post | null>(null);
    const [isCaptioning, setIsCaptioning] = React.useState(false);
    
    const [businessProfile, setBusinessProfile] = React.useState<BusinessProfile | null>(null);
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

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else {
                setProfile(null);
                setCurrentScreen(Screen.Login);
                setAuthLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                setProfile(data);
                // Direcionamento Automático: Se já tem tipo, vai direto pro feed ou dashboard
                if (data.account_type === 'personal') {
                    setCurrentScreen(Screen.Feed);
                } else if (data.account_type === 'business') {
                    // Simula carregamento de perfil business para fins de demonstração
                    setBusinessProfile({
                        id: userId,
                        business_name: 'Minha Loja Premium',
                        business_category: 'fashion',
                        description: 'Qualidade e estilo para você.',
                        logo_url: 'https://i.postimg.cc/pTbvCjjp/NEW-FEELING.png'
                    });
                    setCurrentScreen(Screen.VendorDashboard);
                } else {
                    setCurrentScreen(Screen.AccountTypeSelection);
                }
            } else {
                // If profile doesn't exist, create it
                const newProfile: Profile = {
                    id: userId,
                    username: 'User_' + userId.substring(0, 5),
                    bio: '',
                    profile_image_url: null,
                    cover_image_url: null,
                    account_type: null,
                    verification_status: 'unverified',
                    reward_points: 0
                };
                await supabase.from('profiles').insert([newProfile]);
                setProfile(newProfile);
                setCurrentScreen(Screen.AccountTypeSelection);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setAuthLoading(false);
        }
    };

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleToggleFollow = (targetId: string) => {
        setFollowingIds(prev => {
            const newSet = new Set(prev);
            const isFollowing = newSet.has(targetId);
            if (isFollowing) {
                newSet.delete(targetId);
                setFollowersCountMap(prevMap => ({ ...prevMap, [targetId]: Math.max(0, (prevMap[targetId] || 0) - 1) }));
                setToast('Deixou de seguir');
            } else {
                newSet.add(targetId);
                setFollowersCountMap(prevMap => ({ ...prevMap, [targetId]: (prevMap[targetId] || 0) + 1 }));
                setToast('Seguindo');
            }
            return newSet;
        });
    };

    const handleSetAccountType = async (type: 'personal' | 'business') => {
        if (!profile) return;
        const updatedProfile = { ...profile, account_type: type };
        const { error } = await supabase.from('profiles').update({ account_type: type }).eq('id', profile.id);
        if (error) {
            setError("Erro ao salvar tipo de conta.");
            return;
        }
        setProfile(updatedProfile);
        if (type === 'personal') setCurrentScreen(Screen.Feed);
        else setCurrentScreen(Screen.BusinessOnboarding);
    };
    
    const handleCompleteBusinessOnboarding = (details: Omit<BusinessProfile, 'id'>) => {
        if (!profile) return;
        const newBusinessProfile: BusinessProfile = { id: profile.id, ...details };
        setBusinessProfile(newBusinessProfile);
        setCurrentScreen(Screen.VendorDashboard);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const handleUpdateProfile = async (updates: { username?: string, bio?: string }) => {
        if (!profile) return;
        const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
        if (error) {
            setError("Erro ao atualizar perfil.");
            return;
        }
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        setToast('Perfil atualizado!');
    };

    const handleImageUpload = async (imageDataUrl: string) => {
        setUserImage(imageDataUrl);
        setLoadingMessage("IA preparando seu espaço...");
        setIsLoading(true);
        setError(null);
        try {
            setGeneratedImage(imageDataUrl);
            setImageHistory([imageDataUrl]);
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
        if (newStack.length === 0) handleNavigateToProfile();
        else {
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
            if (!userImage) { setError("Carregue uma foto do ambiente."); setCurrentScreen(Screen.ImageSourceSelection); return; }
            setPlacingItem(item); setCurrentScreen(Screen.DecorationPlacement); return;
        }
        if (itemType === 'fashion' || item.isTryOn) {
            if (!userImage) {
                 if (profile && profile.profile_image_url) setUserImage(profile.profile_image_url);
                 else { setError("Carregue uma foto primeiro."); setCurrentScreen(Screen.ImageSourceSelection); return; }
            }
            const baseImage = generatedImage || userImage!;
            setIsLoading(true);
            try {
                const generatorFunction = item.isTryOn && itemType === 'beauty' ? generateBeautyTryOnImage : generateTryOnImage;
                const newImage = await (generatorFunction === generateTryOnImage
                    ? (generatorFunction as any)(baseImage, item, wornItems)
                    : (generatorFunction as any)(baseImage, item));
                setGeneratedImage(newImage);
                setImageHistory(prev => [...prev, newImage]);
                setWornItems(prevItems => [...prevItems, item]);
                setCurrentScreen(Screen.Result);
            } catch (err: any) {
                setError("Falha ao gerar look.");
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
        try {
            const newImage = await generateDecorationImage(compositeImage);
            setGeneratedImage(newImage);
            setImageHistory(prev => [...prev, newImage]);
            if (placingItem) setWornItems(prevItems => [...prevItems, placingItem]);
            setPlacingItem(null);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError("Erro ao gerar imagem.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartNewTryOnSession = async (item: Item) => {
        if (!userImage) { setCurrentScreen(Screen.ImageSourceSelection); return; }
        setIsLoading(true);
        try {
            const newImage = await generateTryOnImage(userImage, item, []);
            setGeneratedImage(newImage);
            setImageHistory([userImage, newImage]);
            setWornItems([item]);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError("Ocorreu um erro.");
        } finally {
            setIsLoading(false);
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
        try {
            const videoUrl = await generateFashionVideo(generatedImage!, (msg) => setLoadingMessage(msg));
            setGeneratedVideoUrl(videoUrl);
            setShowVideoPlayer(true);
        } catch (err: any) {
            setError("Falha ao gerar vídeo.");
        } finally {
            setIsLoading(false);
        }
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

    const resetToHome = () => {
        setGeneratedImage(userImage);
        setWornItems([]);
        setImageHistory(userImage ? [userImage] : []);
        setNavigationStack([]);
        setCollectionIdentifier(null);
        if (confirmationMessage.toLowerCase().includes('publicado')) setCurrentScreen(Screen.Feed);
        else handleNavigateToProfile();
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c));
        setCurrentScreen(Screen.Chat);
    };

    const handleNavigateToProfile = () => {
        setViewedProfileId(null);
        if (profile?.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
        else setCurrentScreen(Screen.Home);
    };

    const handleViewProfile = async (profileId: string) => {
        if (profileId === profile?.id) { handleNavigateToProfile(); return; }
        setViewedProfileId(profileId);
        setCurrentScreen(Screen.Home);
    };

    const handleConfirmPromotion = (details: any) => {
        if (promotionModalConfig.accountType === 'business') {
            setPromotedContent({ items: details.items });
            setToast(`Promoção ativada!`);
        } else {
            const postIds = new Set(details.items.map((item: any) => item.id));
            setPosts(prev => prev.map(p => postIds.has(p.id) ? { ...p, isSponsored: true } : p));
            setToast(`Espaço promovido!`);
        }
        setPromotionModalConfig({ isOpen: false, accountType: null });
    };

    const renderScreen = () => {
        if (isLoading) return <LoadingIndicator userImage={userImage || ''} customMessage={loadingMessage} />;
        const currentNode = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;
        
        switch (currentScreen) {
            case Screen.Login: return <LoginScreen />;
            case Screen.DecorationPlacement:
                if (userImage && placingItem) return <DecorationPlacementScreen userImage={userImage} item={placingItem} onBack={() => { setPlacingItem(null); setCurrentScreen(Screen.ItemSelection); }} onConfirm={handleConfirmPlacement} />;
                setCurrentScreen(Screen.ItemSelection); return null;
            case Screen.SplitCamera:
                if (splitCameraItem) return <SplitCameraScreen item={splitCameraItem} onBack={() => setCurrentScreen(Screen.ItemSelection)} onRecordingComplete={(blob) => { setEditingVideoDetails({ blob, item: splitCameraItem }); setCurrentScreen(Screen.VideoEdit); }} />;
                setCurrentScreen(Screen.ItemSelection); return null;
            case Screen.VideoEdit:
                if (editingVideoDetails) return <VideoEditScreen videoBlob={editingVideoDetails.blob} item={editingVideoDetails.item} onBack={() => setCurrentScreen(Screen.SplitCamera)} onPublish={(d) => { handlePostToFeed(d.caption); setEditingVideoDetails(null); }} isPublishing={isPublishing} />;
                setCurrentScreen(Screen.ItemSelection); return null;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={handleSetAccountType} />;
            case Screen.BusinessOnboarding: return <BusinessOnboardingScreen onComplete={handleCompleteBusinessOnboarding} />;
            case Screen.VendorDashboard:
                if (businessProfile) return <VendorDashboard businessProfile={businessProfile} onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={0} onOpenNotificationsPanel={() => setShowNotificationsPanel(true)} onOpenPromotionModal={() => setPromotionModalConfig({ isOpen: true, accountType: 'business' })} followersCount={0} followingCount={0} onStartCreate={() => { setNavigationStack([]); setCurrentScreen(Screen.ImageSourceSelection); }} />;
                setCurrentScreen(Screen.BusinessOnboarding); return null;
            case Screen.Home: return <HomeScreen loggedInProfile={profile!} viewedProfileId={viewedProfileId} onUpdateProfileImage={(url) => setProfile(p => p ? {...p, profile_image_url: url} : null)} onUpdateProfile={handleUpdateProfile} onSelectCategory={handleSelectCategory} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => setCurrentScreen(Screen.MyLooks)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => setCurrentScreen(Screen.ChatList)} onNavigateToSettings={() => setCurrentScreen(Screen.Settings)} onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => { setNavigationStack([]); setCurrentScreen(Screen.ImageSourceSelection); }} onSignOut={handleSignOut} isCartAnimating={isCartAnimating} onBack={handleProfileBack} posts={posts} onItemClick={handleItemSelect} onViewProfile={handleViewProfile} unreadNotificationCount={0} unreadMessagesCount={0} onOpenNotificationsPanel={() => setShowNotificationsPanel(true)} isFollowing={viewedProfileId ? followingIds.has(viewedProfileId) : false} onToggleFollow={handleToggleFollow} followersCount={viewedProfileId ? followersCountMap[viewedProfileId] || 0 : 0} followingCount={!viewedProfileId ? followingIds.size : 0} />;
            case Screen.Settings: return <SettingsScreen profile={profile!} onBack={handleNavigateToProfile} theme={theme} onToggleTheme={toggleTheme} onNavigateToVerification={() => setCurrentScreen(Screen.VerificationIntro)} onSignOut={handleSignOut} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={handleImageUpload} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={handleNavigateToProfile} />;
            case Screen.SubCategorySelection: if (currentNode) return <SubCategorySelectionScreen node={currentNode} onSelectSubCategory={handleSelectSubCategory} onBack={handleBack} />;
                 handleNavigateToProfile(); return null;
            case Screen.ItemSelection: if (collectionIdentifier) { const displayImage = userImage || (profile?.profile_image_url || ''); return <ItemSelectionScreen userImage={displayImage} collectionId={collectionIdentifier.id} collectionName={collectionIdentifier.name} collectionType={collectionIdentifier.type} onItemSelect={handleItemSelect} onOpenSplitCamera={(item) => { setSplitCameraItem(item); setCurrentScreen(Screen.SplitCamera); }} onBack={() => setCurrentScreen(Screen.SubCategorySelection)} onBuy={(i) => { setConfirmationMessage(`Pedido de ${i.name} confirmado!`); setCurrentScreen(Screen.Confirmation); }} onAddToCart={(i) => { setCartItems(prev => [...prev, i]); setToast(`${i.name} no carrinho!`); }} />; }
                handleNavigateToProfile(); return null;
            case Screen.Camera: return <CameraScreen onPhotoTaken={handleImageUpload} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.Result: if (generatedImage && collectionIdentifier) return <ResultScreen generatedImage={generatedImage} items={wornItems} categoryItems={ITEMS.filter(i => i.category.startsWith(collectionIdentifier.id.split('_')[0]))} onBuy={(items) => { setConfirmationMessage(`Pedido de ${items.length} itens confirmado!`); setCurrentScreen(Screen.Confirmation); }} onUndo={handleUndoLastItem} onStartPublishing={() => setIsCaptioning(true)} onSaveImage={() => setToast('Imagem salva!')} onItemSelect={handleItemSelect} onAddMoreItems={handleBack} onGenerateVideo={handleGenerateVideo} />;
                setCurrentScreen(Screen.Home); return null;
            case Screen.Confirmation: return <ConfirmationScreen message={confirmationMessage} onHome={resetToHome} />;
            case Screen.Feed: return <FeedScreen posts={posts} stories={stories} profile={profile!} businessProfile={businessProfile} isProfilePromoted={!!promotedContent} promotedItems={promotedContent?.items || []} onBack={handleNavigateToProfile} onItemClick={handleItemSelect} onAddToCartMultiple={(items) => { setCartItems(prev => [...prev, ...items]); setToast('Itens adicionados!'); }} onBuyMultiple={(items) => { setConfirmationMessage(`Pedido de ${items.length} itens confirmado!`); setCurrentScreen(Screen.Confirmation); }} onViewProfile={handleViewProfile} onSelectCategory={handleSelectCategory} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p))} onAddComment={(id, text) => setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, { id: `c_${Date.now()}`, user: { id: profile!.id, name: profile!.username, avatar: profile!.profile_image_url || '' }, text, timestamp: new Date().toISOString() }], commentCount: p.commentCount + 1 } : p))} onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)} onStartCreate={() => { setNavigationStack([]); setCurrentScreen(Screen.ImageSourceSelection); }} unreadNotificationCount={0} onNotificationsClick={() => setShowNotificationsPanel(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.MyLooks: return <MyLooksScreen looks={savedLooks} onBack={handleNavigateToProfile} onItemClick={handleItemSelect} onBuyLook={(items) => { setConfirmationMessage(`Pedido de ${items.length} itens confirmado!`); setCurrentScreen(Screen.Confirmation); }} onPostLook={(look) => { setPosts(prev => [{ id: `post_${Date.now()}`, user: { id: profile!.id, name: profile!.username, avatar: profile!.profile_image_url || '' }, image: look.image, items: look.items, likes: 0, isLiked: false, comments: [], commentCount: 0 }, ...prev]); setCurrentScreen(Screen.Feed); }} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={handleNavigateToProfile} onRemoveItem={(idx) => setCartItems(prev => prev.filter((_, i) => i !== idx))} onBuyItem={(item) => { setConfirmationMessage(`Pedido de ${item.name} confirmado!`); setCurrentScreen(Screen.Confirmation); }} onTryOnItem={handleStartNewTryOnSession} onCheckout={() => { setConfirmationMessage(`Pedido de ${cartItems.length} itens confirmado!`); setCurrentScreen(Screen.Confirmation); }} />;
            case Screen.Rewards: return <RewardsScreen onBack={handleNavigateToProfile} points={profile?.reward_points || 0} />;
            case Screen.ChatList: return <ChatListScreen conversations={conversations} onBack={handleNavigateToProfile} onSelectConversation={handleSelectConversation} />;
            case Screen.Chat: if (selectedConversation) return <ChatScreen conversation={selectedConversation} currentUser={profile!} onBack={() => setCurrentScreen(Screen.ChatList)} onSendMessage={(text) => setConversations(prev => prev.map(c => c.id === selectedConversation.id ? { ...c, lastMessage: { id: `m_${Date.now()}`, text, senderId: profile!.id, timestamp: new Date().toISOString() } } : c))} />;
                setCurrentScreen(Screen.ChatList); return null;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={ITEMS} onViewProfile={handleViewProfile} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p))} onItemClick={handleItemSelect} onItemAction={handleItemSelect} onOpenSplitCamera={(item) => { setSplitCameraItem(item); setCurrentScreen(Screen.SplitCamera); }} onOpenComments={(id) => setCommentingPost(posts.find(p => p.id === id) || null)} onAddToCart={(item) => { setCartItems(prev => [...prev, item]); setToast('Adicionado!'); }} onBuy={(item) => { setConfirmationMessage(`Confirmado!`); setCurrentScreen(Screen.Confirmation); }} />;
            case Screen.AllHighlights: return <AllHighlightsScreen categories={CATEGORIES} onBack={() => setCurrentScreen(Screen.Feed)} onSelectCategory={handleSelectCategory} />;
            case Screen.VerificationIntro: return <VerificationIntroScreen onBack={() => setCurrentScreen(Screen.Settings)} onStart={() => setCurrentScreen(Screen.IdUpload)} />;
            case Screen.IdUpload: return <IdUploadScreen onBack={() => setCurrentScreen(Screen.VerificationIntro)} onComplete={() => setCurrentScreen(Screen.FaceScan)} />;
            case Screen.FaceScan: return <FaceScanScreen onBack={() => setCurrentScreen(Screen.IdUpload)} onComplete={() => { if (profile) setProfile({...profile, verification_status: 'pending'}); setCurrentScreen(Screen.VerificationPending); }} />;
            case Screen.VerificationPending: return <VerificationPendingScreen onComplete={() => { if (profile) setProfile({...profile, verification_status: 'verified'}); setConfirmationMessage('Verificado!'); setCurrentScreen(Screen.Confirmation); }} />;
            default: setCurrentScreen(Screen.Feed); return null;
        }
    };

    if (authLoading) return <SplashScreen />;
    
    const showNavBar = SCREENS_WITH_NAVBAR.includes(currentScreen);

    return (
        <div className="h-full w-full max-w-lg mx-auto bg-[var(--bg-main)] flex flex-col relative font-sans overflow-hidden">
            <div className="flex-grow overflow-hidden relative">{renderScreen()}</div>
            {showNavBar && profile && ( <div className="flex-shrink-0"> <BottomNavBar activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => setPromotionModalConfig({ isOpen: true, accountType: profile.account_type })} onNavigateToProfile={handleNavigateToProfile} onStartTryOn={() => { setNavigationStack([]); setCurrentScreen(Screen.ImageSourceSelection); }} isCartAnimating={isCartAnimating} accountType={profile.account_type} onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)} /> </div> )}
            {toast && ( <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm animate-fadeIn z-50"> {toast} </div> )}
            {error && ( <div className="absolute top-0 left-0 right-0 p-3 bg-red-500/90 text-white text-sm flex justify-between items-center z-50"> <span>{error}</span> <button onClick={() => setError(null)}><XCircleIcon className="w-5 h-5"/></button> </div> )}
            {showCoinAnimation && <CoinBurst />}
            {showNotificationsPanel && ( <NotificationsPanel notifications={notifications} onClose={() => setShowNotificationsPanel(false)} onNotificationClick={(n) => { setShowNotificationsPanel(false); if (n.relatedCategoryId) handleSelectCategory(CATEGORIES.find(c => c.id === n.relatedCategoryId)!); }} /> )}
            {showVideoPlayer && generatedVideoUrl && ( <VideoPlayerModal videoUrl={generatedVideoUrl} onClose={() => setShowVideoPlayer(false)} onPublish={handlePublishVideo} onSave={() => setToast('Salvo!')} isPublishing={isPublishing} /> )}
            {showVendorMenu && ( <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => { setCurrentScreen(Screen.VendorAffiliates); setShowVendorMenu(false); }} onNavigateToCollaborations={() => { setCurrentScreen(Screen.VendorCollaborations); setShowVendorMenu(false); }} onSignOut={handleSignOut} /> )}
            {commentingPost && profile && ( <CommentsModal post={commentingPost} currentUser={profile} onClose={() => setCommentingPost(null)} onAddComment={(id, text) => { /* logic */ }} /> )}
            {promotionModalConfig.isOpen && ( <PromotionModal accountType={promotionModalConfig.accountType!} profile={promotionModalConfig.accountType === 'business' ? businessProfile! : profile!} userPosts={posts.filter(p => p.user.id === profile?.id)} onClose={() => setPromotionModalConfig({ isOpen: false, accountType: null })} onConfirm={handleConfirmPromotion} /> )}
            {isCaptioning && (generatedImage || repostingItem) && ( <CaptionModal image={repostingItem ? repostingItem.image : generatedImage!} onClose={() => { setIsCaptioning(false); setRepostingItem(null); }} onPublish={handlePostToFeed} /> )}
            {recommendationItem && ( <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={(item) => { setCartItems(prev => [...prev, item]); setRecommendationItem(null); }} onStartTryOn={(item) => { setRecommendationItem(null); setTimeout(() => handleItemSelect(item), 100); }} /> )}
        </div>
    );
};

export default App;
