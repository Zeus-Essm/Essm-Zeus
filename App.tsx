
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

// Fix: Export App as default to resolve the import error in index.tsx
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
    const [promotionModalConfig, setPromotionModalConfig] = React.useState<{ isOpen: boolean; accountType: 'personal' | 'business' | null }>({ isOpen: false, accountType: null });
    
    const [recommendationItem, setRecommendationItem] = React.useState<Item | null>(null);
    const [splitCameraItem, setSplitCameraItem] = React.useState<Item | null>(null);
    const [editingVideoDetails, setEditingVideoDetails] = React.useState<{ blob: Blob; item: Item } | null>(null);
    const [repostingItem, setRepostingItem] = React.useState<Item | null>(null);
    const [placingItem, setPlacingItem] = React.useState<Item | null>(null);

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

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                setProfile(data);
                if (data.account_type === 'personal') {
                    setCurrentScreen(Screen.Feed);
                } else if (data.account_type === 'business') {
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

    // Fix: Corrected state updater to return the new Set instance
    const handleToggleFollow = (targetId: string) => {
        setFollowingIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(targetId)) {
                newSet.delete(targetId);
                setFollowersCountMap(pm => ({ ...pm, [targetId]: Math.max(0, (pm[targetId] || 0) - 1) }));
            } else {
                newSet.add(targetId);
                setFollowersCountMap(pm => ({ ...pm, [targetId]: (pm[targetId] || 0) + 1 }));
            }
            return newSet;
        });
    };

    const handleGenerateTryOn = async (userImg: string, newItem: Item, existing: Item[]) => {
        setIsLoading(true);
        setLoadingMessage("Gerando seu visual...");
        setCurrentScreen(Screen.Generating);
        try {
            const result = newItem.beautyType 
                ? await generateBeautyTryOnImage(userImg, newItem)
                : await generateTryOnImage(userImg, newItem, existing);
            setGeneratedImage(result);
            setImageHistory(prev => [...prev, result]);
            setWornItems(prev => [...prev, newItem]);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError(err.message);
            setCurrentScreen(Screen.ItemSelection);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateDecoration = async (composite: string) => {
        setIsLoading(true);
        setLoadingMessage("Integrando decoração com IA...");
        setCurrentScreen(Screen.Generating);
        try {
            const result = await generateDecorationImage(composite);
            setGeneratedImage(result);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError(err.message);
            setCurrentScreen(Screen.ItemSelection);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!generatedImage) return;
        setIsLoading(true);
        try {
            const url = await generateFashionVideo(generatedImage, setLoadingMessage);
            setGeneratedVideoUrl(url);
            setShowVideoPlayer(true);
        } catch (err: any) {
            alert("Erro ao gerar vídeo: " + err.message);
        } finally {
            setIsLoading(false);
            setLoadingMessage(null);
        }
    };

    const handlePublishVideo = async (details: { caption: string; position: any }) => {
        if (!editingVideoDetails || !profile) return;
        setIsPublishing(true);
        const newPost: Post = {
            id: Date.now().toString(),
            user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
            image: editingVideoDetails.item.image,
            video: URL.createObjectURL(editingVideoDetails.blob),
            items: [editingVideoDetails.item],
            likes: 0,
            isLiked: false,
            comments: [],
            commentCount: 0,
            caption: details.caption,
            layout: 'product-overlay',
            overlayPosition: details.position
        };
        setPosts(prev => [newPost, ...prev]);
        setIsPublishing(false);
        setCurrentScreen(Screen.Confirmation);
        setConfirmationMessage("Vídeo publicado com sucesso!");
    };

    const onAddToCart = (item: Item) => {
        setCartItems(prev => [...prev, item]);
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 1000);
    };

    const renderScreenContent = () => {
        switch (currentScreen) {
            case Screen.Login: return <LoginScreen />;
            case Screen.AccountTypeSelection: 
                return <AccountTypeSelectionScreen onSelect={async (type) => {
                    if (profile) {
                        await supabase.from('profiles').update({ account_type: type }).eq('id', profile.id);
                        setProfile({ ...profile, account_type: type });
                        if (type === 'business') setCurrentScreen(Screen.BusinessOnboarding);
                        else setCurrentScreen(Screen.Feed);
                    }
                }} />;
            case Screen.BusinessOnboarding:
                return <BusinessOnboardingScreen onComplete={(details) => {
                    if (profile) {
                        setBusinessProfile({ id: profile.id, ...details });
                        setCurrentScreen(Screen.VendorDashboard);
                    }
                }} />;
            case Screen.VendorDashboard:
                return businessProfile && <VendorDashboard 
                    businessProfile={businessProfile} 
                    onOpenMenu={() => setShowVendorMenu(true)}
                    unreadNotificationCount={notifications.filter(n => !n.read).length}
                    onOpenNotificationsPanel={() => setShowNotificationsPanel(true)}
                    onOpenPromotionModal={() => setPromotionModalConfig({ isOpen: true, accountType: 'business' })}
                    followersCount={followersCountMap[profile?.id || ''] || 0}
                    followingCount={followingIds.size}
                    onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)}
                />;
            case Screen.Feed:
                return profile && <FeedScreen 
                    posts={posts} stories={stories} profile={profile}
                    businessProfile={businessProfile} isProfilePromoted={!!promotedContent} promotedItems={promotedContent?.items || []}
                    onBack={() => {}} onItemClick={setRecommendationItem} onAddToCartMultiple={it => it.forEach(onAddToCart)}
                    onBuyMultiple={it => { it.forEach(onAddToCart); setCurrentScreen(Screen.Cart); }}
                    onViewProfile={setViewedProfileId} onSelectCategory={c => { setCollectionIdentifier({ id: c.id, name: c.name, type: c.type }); setNavigationStack([c]); setCurrentScreen(Screen.SubCategorySelection); }}
                    onLikePost={id => setPosts(ps => ps.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p))}
                    onAddComment={(id, text) => {
                        const com: Comment = { id: Date.now().toString(), user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' }, text, timestamp: new Date().toISOString() };
                        setPosts(ps => ps.map(p => p.id === id ? { ...p, comments: [...p.comments, com], commentCount: p.commentCount + 1 } : p));
                    }}
                    onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)}
                    onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)}
                    unreadNotificationCount={notifications.filter(n => !n.read).length}
                    onNotificationsClick={() => setShowNotificationsPanel(true)}
                    onSearchClick={() => setCurrentScreen(Screen.Search)}
                />;
            case Screen.Home:
                return profile && <HomeScreen 
                    loggedInProfile={profile} viewedProfileId={viewedProfileId}
                    onUpdateProfile={u => setProfile(p => p ? { ...p, ...u } : null)}
                    onUpdateProfileImage={i => setProfile(p => p ? { ...p, profile_image_url: i } : null)}
                    onSelectCategory={c => { setCollectionIdentifier({ id: c.id, name: c.name, type: c.type }); setNavigationStack([c]); setCurrentScreen(Screen.SubCategorySelection); }}
                    onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => setCurrentScreen(Screen.MyLooks)}
                    onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => setCurrentScreen(Screen.ChatList)}
                    onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)}
                    isCartAnimating={isCartAnimating} onBack={() => setViewedProfileId(null)} posts={posts} onItemClick={setRecommendationItem}
                    onViewProfile={setViewedProfileId} onNavigateToSettings={() => setCurrentScreen(Screen.Settings)} onSignOut={() => supabase.auth.signOut()}
                    unreadNotificationCount={notifications.filter(n => !n.read).length} unreadMessagesCount={0} onOpenNotificationsPanel={() => setShowNotificationsPanel(true)}
                    isFollowing={followingIds.has(viewedProfileId || '')} onToggleFollow={handleToggleFollow}
                    followersCount={followersCountMap[viewedProfileId || profile.id] || 0}
                    followingCount={viewedProfileId && viewedProfileId !== profile.id ? 0 : followingIds.size}
                />;
            case Screen.Search:
                return <SearchScreen 
                    onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={ITEMS}
                    onViewProfile={id => { setViewedProfileId(id); setCurrentScreen(Screen.Home); }}
                    onLikePost={id => setPosts(ps => ps.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p))}
                    onItemClick={setRecommendationItem} onItemAction={it => { setCollectionIdentifier({ id: it.category, name: 'Produto', type: getCategoryTypeFromItem(it) }); handleGenerateTryOn(userImage || '', it, []); }}
                    onOpenSplitCamera={it => { setSplitCameraItem(it); setCurrentScreen(Screen.SplitCamera); }}
                    onOpenComments={id => setCommentingPost(posts.find(p => p.id === id) || null)}
                    onAddToCart={onAddToCart} onBuy={it => { onAddToCart(it); setCurrentScreen(Screen.Cart); }}
                />;
            case Screen.Cart:
                return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(Screen.Feed)} onRemoveItem={i => setCartItems(ps => ps.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={it => handleGenerateTryOn(userImage || '', it, [])} onCheckout={() => setCartItems([])} />;
            case Screen.Settings:
                return profile && <SettingsScreen onBack={() => setCurrentScreen(Screen.Home)} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} profile={profile} onNavigateToVerification={() => setCurrentScreen(Screen.VerificationIntro)} onSignOut={() => supabase.auth.signOut()} />;
            case Screen.ImageSourceSelection:
                return <ImageSourceSelectionScreen onBack={() => setCurrentScreen(Screen.Feed)} onImageUpload={i => { setUserImage(i); setCurrentScreen(Screen.Feed); }} onUseCamera={() => setCurrentScreen(Screen.Camera)} />;
            case Screen.Camera:
                return <CameraScreen onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} onPhotoTaken={i => { setUserImage(i); setCurrentScreen(Screen.Feed); }} />;
            case Screen.Generating:
                return userImage && <LoadingIndicator userImage={userImage} customMessage={loadingMessage} />;
            case Screen.Result:
                return generatedImage && collectionIdentifier && <ResultScreen 
                    generatedImage={generatedImage} items={wornItems} categoryItems={ITEMS.filter(i => i.category === collectionIdentifier.id)}
                    onBuy={it => { it.forEach(onAddToCart); setCurrentScreen(Screen.Cart); }}
                    onUndo={() => { setWornItems(ps => ps.slice(0, -1)); setImageHistory(ps => ps.slice(0, -1)); setGeneratedImage(imageHistory[imageHistory.length - 2] || null); }}
                    onStartPublishing={() => setIsCaptioning(true)} onSaveImage={() => {}}
                    onItemSelect={it => handleGenerateTryOn(generatedImage, it, wornItems)} onAddMoreItems={() => setCurrentScreen(Screen.ItemSelection)} onGenerateVideo={handleGenerateVideo}
                />;
            case Screen.SplitCamera:
                return splitCameraItem && <SplitCameraScreen item={splitCameraItem} onBack={() => setCurrentScreen(Screen.ItemSelection)} onRecordingComplete={b => { setEditingVideoDetails({ blob: b, item: splitCameraItem }); setCurrentScreen(Screen.VideoEdit); }} />;
            case Screen.VideoEdit:
                return editingVideoDetails && <VideoEditScreen videoBlob={editingVideoDetails.blob} item={editingVideoDetails.item} onBack={() => setCurrentScreen(Screen.SplitCamera)} onPublish={handlePublishVideo} isPublishing={isPublishing} />;
            case Screen.Confirmation:
                return <ConfirmationScreen message={confirmationMessage} onHome={() => setCurrentScreen(Screen.Feed)} />;
            case Screen.Rewards:
                return <RewardsScreen onBack={() => setCurrentScreen(Screen.Home)} points={profile?.reward_points || 0} />;
            case Screen.VendorAnalytics:
                return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            case Screen.VendorProducts:
                return businessProfile && <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile} />;
            case Screen.VendorAffiliates:
                return <VendorAffiliatesScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            case Screen.VendorCollaborations:
                return <VendorCollaborationsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} collaborationRequests={[]} posts={posts} />;
            case Screen.AllHighlights:
                return <AllHighlightsScreen categories={CATEGORIES} onBack={() => setCurrentScreen(Screen.Feed)} onSelectCategory={c => { setCollectionIdentifier({ id: c.id, name: c.name, type: c.type }); setCurrentScreen(Screen.ItemSelection); }} />;
            case Screen.DecorationPlacement:
                return userImage && placingItem && <DecorationPlacementScreen userImage={userImage} item={placingItem} onBack={() => setCurrentScreen(Screen.ItemSelection)} onConfirm={handleGenerateDecoration} />;
            default:
                return <SplashScreen />;
        }
    };

    // Fix: App component must return its UI structure
    return (
        <div className="h-full w-full bg-[var(--bg-main)] overflow-hidden flex flex-col relative">
            <div className="flex-grow relative">
                {renderScreenContent()}
            </div>
            {SCREENS_WITH_NAVBAR.includes(currentScreen) && (
                <BottomNavBar 
                    activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)}
                    onNavigateToCart={() => setCurrentScreen(Screen.Cart)}
                    onNavigateToPromotion={() => setPromotionModalConfig({ isOpen: true, accountType: profile?.account_type || null })}
                    onNavigateToProfile={() => { if (profile?.account_type === 'business') setCurrentScreen(Screen.VendorDashboard); else setCurrentScreen(Screen.Home); }}
                    onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={isCartAnimating}
                    accountType={profile?.account_type} onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)}
                />
            )}
            {showNotificationsPanel && <NotificationsPanel notifications={notifications} onClose={() => setShowNotificationsPanel(false)} onNotificationClick={() => {}} />}
            {showVideoPlayer && generatedVideoUrl && <VideoPlayerModal videoUrl={generatedVideoUrl} onClose={() => setShowVideoPlayer(false)} onPublish={() => setIsCaptioning(true)} onSave={() => {}} isPublishing={isPublishing} />}
            {isCaptioning && generatedImage && <CaptionModal image={generatedImage} onClose={() => setIsCaptioning(false)} onPublish={cap => {
                if (profile) {
                    const post: Post = { id: Date.now().toString(), user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' }, image: generatedImage, items: wornItems, likes: 0, isLiked: false, comments: [], commentCount: 0, caption: cap };
                    setPosts(p => [post, ...p]);
                    setIsCaptioning(false); setCurrentScreen(Screen.Confirmation); setConfirmationMessage("Look publicado!");
                }
            }} />}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)} onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} onNavigateToAffiliates={() => setCurrentScreen(Screen.VendorAffiliates)} onNavigateToCollaborations={() => setCurrentScreen(Screen.VendorCollaborations)} onSignOut={() => supabase.auth.signOut()} />}
            {recommendationItem && <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={onAddToCart} onStartTryOn={it => { setRecommendationItem(null); handleGenerateTryOn(userImage || '', it, []); }} />}
        </div>
    );
};

export default App;
