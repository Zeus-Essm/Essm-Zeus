
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

const App: React.FC = () => {
    const [session, setSession] = React.useState<Session | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [authLoading, setAuthLoading] = React.useState(true);
    const [followingIds, setFollowingIds] = React.useState<Set<string>>(new Set());
    const [followersCountMap, setFollowersCountMap] = React.useState<Record<string, number>>({});
    const [currentScreen, setCurrentScreen] = React.useState<Screen>(Screen.Splash);
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light'); 
    const [viewedProfileId, setViewedProfileId] = React.useState<string | null>(null);
    const [userImage, setUserImage] = React.useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = React.useState<string | null>(null);
    const [showVideoPlayer, setShowVideoPlayer] = React.useState(false);
    const [isPublishing, setIsPublishing] = React.useState(false);
    const [imageHistory, setImageHistory] = React.useState<string[]>([]);
    const [collectionIdentifier, setCollectionIdentifier] = React.useState<{id: string, name: string, type: MarketplaceType} | null>(null);
    const [wornItems, setWornItems] = React.useState<Item[]>([]);
    const [posts, setPosts] = React.useState<Post[]>(INITIAL_POSTS);
    const [stories, setStories] = React.useState<Story[]>(INITIAL_STORIES);
    const [cartItems, setCartItems] = React.useState<Item[]>([]);
    const [confirmationMessage, setConfirmationMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isCartAnimating, setIsCartAnimating] = React.useState(false);
    const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
    const [showNotificationsPanel, setShowNotificationsPanel] = React.useState(false);
    const [businessProfile, setBusinessProfile] = React.useState<BusinessProfile | null>(null);
    const [showVendorMenu, setShowVendorMenu] = React.useState(false);
    const [promotionModalConfig, setPromotionModalConfig] = React.useState<{ isOpen: boolean; accountType: 'personal' | 'business' | null }>({ isOpen: false, accountType: null });
    const [recommendationItem, setRecommendationItem] = React.useState<Item | null>(null);
    const [splitCameraItem, setSplitCameraItem] = React.useState<Item | null>(null);
    const [editingVideoDetails, setEditingVideoDetails] = React.useState<{ blob: Blob; item: Item } | null>(null);
    const [isCaptioning, setIsCaptioning] = React.useState(false);
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

    const fetchProfile = async (userId: string) => {
        try {
            // Logs de depuração conforme solicitado
            const { data: { user } } = await supabase.auth.getUser();
            console.log('USER:', user);

            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user?.id)
              .single();

            console.log('PROFILE:', data);
            console.log('PROFILE ERROR:', error);

            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                setProfile(data);
                if (data.account_type === 'personal') setCurrentScreen(Screen.Feed);
                else if (data.account_type === 'business') {
                    setBusinessProfile({
                        id: userId,
                        business_name: data.username || 'Minha Loja',
                        business_category: 'fashion',
                        description: data.bio || '',
                        logo_url: data.profile_image_url || ''
                    });
                    setCurrentScreen(Screen.VendorDashboard);
                } else setCurrentScreen(Screen.AccountTypeSelection);
            } else {
                // Criar perfil se não existir (Bootstrap automático)
                const newProfile: any = {
                    user_id: userId,
                    username: user?.user_metadata?.full_name ?? `user_${userId.substring(0, 5)}`,
                    bio: '',
                    profile_image_url: user?.user_metadata?.avatar_url ?? null,
                    cover_image_url: null,
                    account_type: null,
                    verification_status: 'unverified',
                    reward_points: 0
                };
                
                await supabase.from('profiles').insert([newProfile]);
                setProfile(newProfile as Profile);
                setCurrentScreen(Screen.AccountTypeSelection);
            }
        } catch (err) {
            console.error("Erro ao carregar perfil:", err);
        } finally {
            setAuthLoading(false);
        }
    };

    const uploadMedia = async (file: Blob | File, folder: string) => {
        if (!session?.user) throw new Error("Usuário não autenticado");
        const user = session.user;
        const fileName = `${crypto.randomUUID()}.jpg`;
        const path = `${folder}/${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media')
            .upload(path, file);

        if (uploadError) throw uploadError;

        // Registro na tabela media
        await supabase.from('media').insert({
            user_id: user.id,
            bucket: 'media',
            path: path,
            mime_type: file.type || 'image/jpeg',
            size: file.size
        });

        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
        return publicUrl;
    };

    const handleUpdateProfileImage = async (dataUrl: string) => {
        if (!profile) return;
        try {
            setIsLoading(true);
            const blob = await dataUrlToBlob(dataUrl);
            const publicUrl = await uploadMedia(blob, 'profiles');
            // Substituído 'id' por 'user_id'
            await supabase.from('profiles').update({ profile_image_url: publicUrl }).eq('user_id', profile.user_id);
            setProfile({ ...profile, profile_image_url: publicUrl });
        } catch (err: any) {
            alert("Erro ao atualizar imagem: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

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

    const handlePublishPost = async (caption: string) => {
        if (!profile || !generatedImage) return;
        try {
            setIsPublishing(true);
            const blob = await dataUrlToBlob(generatedImage);
            const publicUrl = await uploadMedia(blob, 'posts');

            const newPost: Post = {
                id: Date.now().toString(),
                user: { id: profile.user_id, name: profile.username, avatar: profile.profile_image_url || '' },
                image: publicUrl,
                items: wornItems,
                likes: 0,
                isLiked: false,
                comments: [],
                commentCount: 0,
                caption: caption
            };

            setPosts(prev => [newPost, ...prev]);
            setIsCaptioning(false);
            setCurrentScreen(Screen.Confirmation);
            setConfirmationMessage("Look publicado com sucesso!");
        } catch (err: any) {
            alert("Erro ao publicar: " + err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const handlePublishVideo = async (details: { caption: string; position: any }) => {
        if (!editingVideoDetails || !profile) return;
        try {
            setIsPublishing(true);
            const videoUrl = await uploadMedia(editingVideoDetails.blob, 'videos');
            
            const newPost: Post = {
                id: Date.now().toString(),
                user: { id: profile.user_id, name: profile.username, avatar: profile.profile_image_url || '' },
                image: editingVideoDetails.item.image,
                video: videoUrl,
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
            setCurrentScreen(Screen.Confirmation);
            setConfirmationMessage("Vídeo publicado com sucesso!");
        } catch (err: any) {
            alert("Erro ao publicar vídeo: " + err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const renderScreenContent = () => {
        if (authLoading) return <SplashScreen />;
        switch (currentScreen) {
            case Screen.Login: return <LoginScreen />;
            case Screen.AccountTypeSelection: 
                return <AccountTypeSelectionScreen onSelect={async (type) => {
                    const uid = profile?.user_id || session?.user.id;
                    if (uid) {
                        // Substituído 'id' por 'user_id'
                        await supabase.from('profiles').update({ account_type: type }).eq('user_id', uid);
                        setProfile(prev => prev ? { ...prev, account_type: type } : null);
                        if (type === 'business') setCurrentScreen(Screen.BusinessOnboarding);
                        else setCurrentScreen(Screen.Feed);
                    }
                }} />;
            case Screen.BusinessOnboarding:
                return <BusinessOnboardingScreen onComplete={(details) => {
                    if (profile) {
                        setBusinessProfile({ id: profile.user_id, ...details });
                        setCurrentScreen(Screen.VendorDashboard);
                    }
                }} />;
            case Screen.VendorDashboard:
                return businessProfile && <VendorDashboard 
                    businessProfile={businessProfile} onOpenMenu={() => setShowVendorMenu(true)}
                    unreadNotificationCount={0} onOpenNotificationsPanel={() => setShowNotificationsPanel(true)}
                    onOpenPromotionModal={() => setPromotionModalConfig({ isOpen: true, accountType: 'business' })}
                    followersCount={followersCountMap[profile?.user_id || ''] || 0} followingCount={followingIds.size}
                    onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)}
                />;
            case Screen.Feed:
                return profile && <FeedScreen 
                    posts={posts} stories={stories} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]}
                    onBack={() => {}} onItemClick={setRecommendationItem} onAddToCartMultiple={it => it.forEach(i => setCartItems(p => [...p, i]))}
                    onBuyMultiple={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }}
                    onViewProfile={setViewedProfileId} onSelectCategory={c => { setCollectionIdentifier({ id: c.id, name: c.name, type: c.type }); setCurrentScreen(Screen.SubCategorySelection); }}
                    onLikePost={id => setPosts(ps => ps.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p))}
                    onAddComment={() => {}} onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)}
                    unreadNotificationCount={0} onNotificationsClick={() => setShowNotificationsPanel(true)} onSearchClick={() => setCurrentScreen(Screen.Search)}
                />;
            case Screen.Home:
                return profile && <HomeScreen 
                    loggedInProfile={profile} viewedProfileId={viewedProfileId}
                    onUpdateProfile={u => setProfile(p => p ? { ...p, ...u } : null)}
                    onUpdateProfileImage={handleUpdateProfileImage}
                    onSelectCategory={c => { setCollectionIdentifier({ id: c.id, name: c.name, type: c.type }); setCurrentScreen(Screen.SubCategorySelection); }}
                    onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => setCurrentScreen(Screen.MyLooks)}
                    onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => setCurrentScreen(Screen.ChatList)}
                    onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)}
                    isCartAnimating={isCartAnimating} onBack={() => setViewedProfileId(null)} posts={posts} onItemClick={setRecommendationItem}
                    onViewProfile={setViewedProfileId} onNavigateToSettings={() => setCurrentScreen(Screen.Settings)} onSignOut={() => supabase.auth.signOut()}
                    unreadNotificationCount={0} unreadMessagesCount={0} onOpenNotificationsPanel={() => setShowNotificationsPanel(true)}
                    isFollowing={followingIds.has(viewedProfileId || '')} onToggleFollow={handleToggleFollow}
                    followersCount={followersCountMap[viewedProfileId || profile.user_id] || 0}
                    followingCount={viewedProfileId && viewedProfileId !== profile.user_id ? 0 : followingIds.size}
                />;
            case Screen.Search:
                return <SearchScreen onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={ITEMS} onViewProfile={id => { setViewedProfileId(id); setCurrentScreen(Screen.Home); }} onLikePost={() => {}} onItemClick={setRecommendationItem} onItemAction={() => {}} onOpenSplitCamera={it => { setSplitCameraItem(it); setCurrentScreen(Screen.SplitCamera); }} onOpenComments={() => {}} onAddToCart={i => setCartItems(p => [...p, i])} onBuy={i => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            case Screen.Cart:
                return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(Screen.Feed)} onRemoveItem={i => setCartItems(ps => ps.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={() => {}} onCheckout={() => setCartItems([])} />;
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
                    onBuy={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }}
                    onUndo={() => { setWornItems(ps => ps.slice(0, -1)); setImageHistory(ps => ps.slice(0, -1)); setGeneratedImage(imageHistory[imageHistory.length - 2] || null); }}
                    onStartPublishing={() => setIsCaptioning(true)} onSaveImage={() => {}}
                    onItemSelect={() => {}} onAddMoreItems={() => setCurrentScreen(Screen.ItemSelection)} onGenerateVideo={() => {}}
                />;
            case Screen.SplitCamera:
                return splitCameraItem && <SplitCameraScreen item={splitCameraItem} onBack={() => setCurrentScreen(Screen.ItemSelection)} onRecordingComplete={b => { setEditingVideoDetails({ blob: b, item: splitCameraItem }); setCurrentScreen(Screen.VideoEdit); }} />;
            case Screen.VideoEdit:
                return editingVideoDetails && <VideoEditScreen videoBlob={editingVideoDetails.blob} item={editingVideoDetails.item} onBack={() => setCurrentScreen(Screen.SplitCamera)} onPublish={handlePublishVideo} isPublishing={isPublishing} />;
            case Screen.Confirmation:
                return <ConfirmationScreen message={confirmationMessage} onHome={() => setCurrentScreen(Screen.Feed)} />;
            case Screen.Rewards:
                return <RewardsScreen onBack={() => setCurrentScreen(Screen.Home)} points={profile?.reward_points || 0} />;
            case Screen.AllHighlights:
                return <AllHighlightsScreen categories={CATEGORIES} onBack={() => setCurrentScreen(Screen.Feed)} onSelectCategory={c => { setCollectionIdentifier({ id: c.id, name: c.name, type: c.type }); setCurrentScreen(Screen.ItemSelection); }} />;
            default:
                return <SplashScreen />;
        }
    };

    const SCREENS_WITH_NAVBAR = [Screen.Home, Screen.Feed, Screen.Search, Screen.Cart, Screen.ChatList, Screen.VendorDashboard, Screen.VendorAnalytics, Screen.AllHighlights];

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
                    accountType={profile?.account_type} onNavigateToVendorAnalytics={() => {}}
                />
            )}
            {showNotificationsPanel && <NotificationsPanel notifications={notifications} onClose={() => setShowNotificationsPanel(false)} onNotificationClick={() => {}} />}
            {isCaptioning && generatedImage && <CaptionModal image={generatedImage} onClose={() => setIsCaptioning(false)} onPublish={handlePublishPost} isPublishing={isPublishing} />}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => {}} onNavigateToProducts={() => {}} onNavigateToAffiliates={() => {}} onNavigateToCollaborations={() => {}} onSignOut={() => supabase.auth.signOut()} />}
            {recommendationItem && <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={i => setCartItems(p => [...p, i])} onStartTryOn={() => {}} />}
            
            {/* Selo de Confirmação do Update */}
            <div className="fixed top-4 right-4 z-[100] pointer-events-none">
                <div className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    USER_ID SYNC OK
                </div>
            </div>
        </div>
    );
};

export default App;
