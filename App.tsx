
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, Product, MarketplaceType, SubCategory } from './types';
import { toast } from './utils/toast';
import { generateTryOnImage } from './services/geminiService';

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import AccountTypeSelectionScreen from './components/AccountTypeSelectionScreen';
import HomeScreen from './components/HomeScreen';
import FeedScreen from './components/FeedScreen';
import CartScreen from './components/CartScreen';
import BottomNavBar from './components/BottomNavBar';
import VendorDashboard from './components/VendorDashboard';
import VendorProductsScreen from './components/VendorProductsScreen';
import SearchScreen from './components/SearchScreen';
import NotificationsPanel from './components/NotificationsPanel';
import SettingsPanel from './components/SettingsPanel';
import ImageSourceSelectionScreen from './components/ImageSourceSelectionScreen';
import CameraScreen from './components/CameraScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ResultScreen from './components/ResultScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import CaptionModal from './components/CaptionModal';
import AllHighlightsScreen from './components/AllHighlightsScreen';
import ItemSelectionScreen from './components/ItemSelectionScreen';
import SubCategorySelectionScreen from './components/SubCategorySelectionScreen';
import VendorMenuModal from './components/VendorMenuModal';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    
    // Estados para Visitação de Perfil
    const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
    const [viewedBusiness, setViewedBusiness] = useState<BusinessProfile | null>(null);
    const [isFollowingViewed, setIsFollowingViewed] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const [products, setProducts] = useState<Product[]>([]);
    const [allMarketplaceProducts, setAllMarketplaceProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [realBusinessCategories, setRealBusinessCategories] = useState<Category[]>([]);
    const [allProfilesForSearch, setAllProfilesForSearch] = useState<Profile[]>([]);
    
    const [selectedCategoryNode, setSelectedCategoryNode] = useState<Category | SubCategory | null>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    const [authLoading, setAuthLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
    
    const [userImage, setUserImage] = useState<string | null>(null);
    const [vtoItems, setVtoItems] = useState<Item[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [cartItems, setCartItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showVendorMenu, setShowVendorMenu] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            location.reload();
        } catch (err) {
            location.reload();
        }
    };

    const fetchGlobalData = async () => {
        try {
            const { data: profiles } = await supabase.from('profiles').select('*');
            if (profiles) {
                setAllProfilesForSearch(profiles);
                const stores: Category[] = profiles
                    .filter(p => p.account_type === 'business')
                    .map(p => ({
                        id: p.user_id,
                        name: p.full_name || p.username || 'Loja PUMP',
                        image: p.avatar_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg',
                        type: (p.business_category as MarketplaceType) || 'fashion', 
                        subCategories: [] 
                    }));
                setRealBusinessCategories(stores);
            }

            const { data: allProds } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (allProds) setAllMarketplaceProducts(allProds);

            const { data: postsData } = await supabase.from('posts').select('*, profiles(*), comments(*, profiles(*)), likes(*)').order('created_at', { ascending: false });
            if (postsData) {
                const formattedPosts: Post[] = postsData.map((p: any) => ({
                    id: p.id,
                    user_id: p.user_id,
                    user: { 
                        id: p.profiles?.user_id || p.user_id, 
                        full_name: p.profiles?.full_name || p.profiles?.username || 'Utilizador PUMP', 
                        avatar_url: p.profiles?.avatar_url || null
                    },
                    image: p.image_url,
                    caption: p.caption,
                    likes: p.likes?.length || 0,
                    isLiked: p.likes?.some((l: any) => l.user_id === session?.user.id),
                    created_at: p.created_at,
                    comments: (p.comments || []).map((c: any) => ({
                        id: c.id,
                        text: c.text,
                        timestamp: c.created_at,
                        user: { id: c.profiles?.user_id, full_name: c.profiles?.full_name, avatar_url: c.profiles?.avatar_url }
                    })),
                    commentCount: p.comments?.length || 0,
                    items: [] 
                }));
                setPosts(formattedPosts);
            }
        } catch (err) { console.error(err); }
    };

    const handleToggleFollow = async (targetUserId: string) => {
        if (!session) return;
        try {
            if (isFollowingViewed) {
                await supabase.from('follows').delete().eq('follower_id', session.user.id).eq('following_id', targetUserId);
                setIsFollowingViewed(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
            } else {
                await supabase.from('follows').insert({ follower_id: session.user.id, following_id: targetUserId });
                setIsFollowingViewed(true);
                setFollowersCount(prev => prev + 1);
            }
        } catch (err) {
            toast.error("Erro ao processar ação.");
        }
    };

    const handleViewProfile = async (targetUserId: string) => {
        setIsLoading(true);
        try {
            const { data: targetProfile } = await supabase.from('profiles').select('*').eq('user_id', targetUserId).single();
            if (!targetProfile) return;

            // Buscar Stats
            const [followers, following, isFollowing] = await Promise.all([
                supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', targetUserId),
                supabase.from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', targetUserId),
                session ? supabase.from('follows').select('id').eq('follower_id', session.user.id).eq('following_id', targetUserId).maybeSingle() : { data: null }
            ]);

            setFollowersCount(followers.count || 0);
            setFollowingCount(following.count || 0);
            setIsFollowingViewed(!!isFollowing.data);
            setViewedProfile(targetProfile);

            if (targetProfile.account_type === 'business') {
                setViewedBusiness({
                    id: targetProfile.user_id,
                    business_name: targetProfile.full_name || targetProfile.username || 'Loja',
                    business_category: targetProfile.business_category || 'fashion',
                    description: targetProfile.bio || '',
                    logo_url: targetProfile.avatar_url || ''
                });
                
                // Buscar pastas e produtos se for empresa
                const [fRes, pRes] = await Promise.all([
                    supabase.from('folders').select('*').eq('owner_id', targetUserId),
                    supabase.from('products').select('*').eq('owner_id', targetUserId)
                ]);
                setFolders(fRes.data || []);
                setProducts(pRes.data || []);
                setCurrentScreen(Screen.VendorDashboard);
            } else {
                setCurrentScreen(Screen.Home);
            }
        } catch (err) {
            toast.error("Erro ao carregar perfil.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfileImage = async (imageDataUrl: string) => {
        if (!session || !profile) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.from('profiles').update({ avatar_url: imageDataUrl }).eq('user_id', session.user.id);
            if (error) throw error;
            setProfile(prev => prev ? { ...prev, avatar_url: imageDataUrl } : null);
            toast.success("Foto atualizada!");
        } catch (err: any) {
            toast.error("Erro ao atualizar foto.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
                    if (data) {
                        setProfile(data);
                        fetchGlobalData();
                        handleViewProfile(session.user.id); // Inicia no próprio perfil
                    } else {
                        setCurrentScreen(Screen.AccountTypeSelection);
                    }
                    setAuthLoading(false);
                });
            } else {
                setCurrentScreen(Screen.Login);
                setAuthLoading(false);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const startTryOn = (item: Item) => {
        if (!userImage) {
            setVtoItems([item]); // Guarda o item para provar depois da foto
            setCurrentScreen(Screen.ImageSourceSelection);
        } else {
            handleGenerateLook(userImage, item, vtoItems);
        }
    };

    const handleGenerateLook = async (image: string, item: Item, existing: Item[]) => {
        setCurrentScreen(Screen.Generating);
        try {
            const result = await generateTryOnImage(image, item, existing);
            setGeneratedImage(result);
            setVtoItems(prev => [...prev, item]);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            toast.error(err.message);
            setCurrentScreen(Screen.Home);
        }
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;

        const uiItems: Item[] = allMarketplaceProducts.map(p => ({
            id: p.id,
            name: p.title,
            description: p.description || '',
            price: p.price,
            image: p.image_url || '',
            category: p.folder_id || p.owner_id || '',
            isTryOn: p.is_try_on
        }));

        switch (currentScreen) {
            case Screen.Login: return <LoginScreen onSuccess={() => {}} />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={async (type) => {
                await supabase.from('profiles').update({ account_type: type }).eq('user_id', session?.user.id);
                window.location.reload();
            }} />;
            case Screen.VendorDashboard: 
                return viewedBusiness && viewedProfile && (
                    <VendorDashboard 
                        businessProfile={viewedBusiness} profile={viewedProfile} folders={folders} products={products} posts={posts}
                        isVisitor={viewedProfile.user_id !== session?.user.id}
                        onBack={() => setCurrentScreen(Screen.Feed)}
                        onCreateFolder={async (title) => {
                            const { data } = await supabase.from('folders').insert({ title, owner_id: profile!.user_id }).select().single();
                            if (data) setFolders(p => [data, ...p]);
                        }} 
                        onDeleteFolder={async (id) => {
                            await supabase.from('folders').delete().eq('id', id);
                            setFolders(p => p.filter(f => f.id !== id));
                        }} 
                        onCreateProductInFolder={async () => {}} 
                        onDeleteProduct={() => {}}
                        onUpdateProfile={() => {}} 
                        onUpdateProfileImage={handleUpdateProfileImage}
                        onNavigateToProducts={(fid) => {
                            setSelectedCollectionId(fid || viewedProfile.user_id);
                            setCurrentScreen(Screen.ItemSelection);
                        }}
                        onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)}
                        onOpenPromotionModal={() => {}} 
                        followersCount={followersCount} followingCount={followingCount}
                        onMoveProductToFolder={async () => {}} onLikePost={() => {}} onAddComment={() => {}} 
                        onItemClick={startTryOn} onViewProfile={handleViewProfile}
                    />
                );
            case Screen.Feed: return profile && (
                <FeedScreen 
                    posts={posts} stories={[]} profile={profile} businessProfile={null} 
                    realBusinesses={realBusinessCategories} isProfilePromoted={false} promotedItems={[]} 
                    onBack={() => {}} onItemClick={startTryOn} onAddToCartMultiple={() => {}} onBuyMultiple={() => {}} 
                    onViewProfile={handleViewProfile} 
                    onSelectCategory={(cat) => handleViewProfile(cat.id)} onLikePost={() => {}} onAddComment={() => {}} 
                    onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} 
                    unreadNotificationCount={0} onNotificationsClick={() => setIsNotificationsOpen(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} 
                />
            );
            case Screen.Home: return profile && (
                <HomeScreen 
                    loggedInProfile={profile} viewedProfileId={viewedProfile?.user_id || null} realBusinesses={realBusinessCategories} 
                    onUpdateProfile={() => {}} onUpdateProfileImage={handleUpdateProfileImage} 
                    onSelectCategory={(cat) => handleViewProfile(cat.id)} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} 
                    onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} 
                    onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} 
                    isCartAnimating={false} onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} onItemClick={startTryOn} 
                    onViewProfile={handleViewProfile} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={handleSignOut} 
                    unreadNotificationCount={0} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} 
                    isFollowing={isFollowingViewed} onToggleFollow={() => handleToggleFollow(viewedProfile!.user_id)} 
                    followersCount={followersCount} followingCount={followingCount} onLikePost={() => {}} onAddComment={() => {}} 
                    onSearchClick={() => setCurrentScreen(Screen.Search)} 
                />
            );
            case Screen.ItemSelection: return selectedCollectionId && (
                <ItemSelectionScreen 
                    userImage={userImage || ''} 
                    collectionId={selectedCollectionId} 
                    collectionName="Catálogo" 
                    collectionType="fashion"
                    itemsFromDb={uiItems} 
                    onItemSelect={startTryOn} onOpenSplitCamera={() => {}} 
                    onBack={() => setCurrentScreen(Screen.VendorDashboard)} 
                    onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} 
                    onAddToCart={(i) => { setCartItems(p => [...p, i]); toast.success("Adicionado!"); }} 
                />
            );
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={(url) => { 
                setUserImage(url); 
                if (vtoItems.length > 0) handleGenerateLook(url, vtoItems[0], []);
                else setCurrentScreen(Screen.Home); 
            }} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(Screen.Feed)} />;
            
            case Screen.Camera: return <CameraScreen onPhotoTaken={(url) => { 
                setUserImage(url); 
                if (vtoItems.length > 0) handleGenerateLook(url, vtoItems[0], []);
                else setCurrentScreen(Screen.Home); 
            }} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;

            case Screen.Generating: return userImage && <LoadingIndicator userImage={generatedImage || userImage} />;
            case Screen.Result: return generatedImage && <ResultScreen generatedImage={generatedImage} items={vtoItems} categoryItems={[]} onBuy={() => setCurrentScreen(Screen.Cart)} onUndo={() => { setVtoItems(v => v.slice(0, -1)); setCurrentScreen(Screen.Home); }} onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={() => {}} onItemSelect={startTryOn} onAddMoreItems={() => setCurrentScreen(Screen.Home)} onGenerateVideo={() => {}} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(Screen.Feed)} onRemoveItem={(i) => setCartItems(p => p.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={startTryOn} onCheckout={() => { toast.success("Pedido enviado!"); setCartItems([]); }} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={uiItems} availableProfiles={allProfilesForSearch} onViewProfile={handleViewProfile} onLikePost={() => {}} onItemClick={startTryOn} onItemAction={startTryOn} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            case Screen.AllHighlights: return <AllHighlightsScreen categories={realBusinessCategories} onBack={() => setCurrentScreen(Screen.Feed)} onSelectCategory={(cat) => handleViewProfile(cat.id)} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className={`h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={[]} onClose={() => setIsNotificationsOpen(false)} onNotificationClick={() => {}} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={handleSignOut} onNavigateToVerification={() => {}} />}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            
            {showCaptionModal && generatedImage && (
                <CaptionModal 
                    image={generatedImage} onClose={() => setShowCaptionModal(false)} 
                    onPublish={async (caption) => {
                        setIsLoading(true);
                        try {
                            await supabase.from('posts').insert({ user_id: session?.user.id, image_url: generatedImage, caption });
                            await fetchGlobalData();
                            setShowCaptionModal(false);
                            setCurrentScreen(Screen.Confirmation);
                        } catch (err) {
                            toast.error("Erro ao publicar post.");
                        } finally {
                            setIsLoading(false);
                        }
                    }} 
                />
            )}
            
            {[Screen.Feed, Screen.Home, Screen.Cart, Screen.Search, Screen.AllHighlights, Screen.VendorDashboard].includes(currentScreen) && (
                <BottomNavBar 
                    activeScreen={currentScreen} 
                    accountType={profile?.account_type} 
                    onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} 
                    onNavigateToCart={() => setCurrentScreen(Screen.Cart)} 
                    onNavigateToPromotion={() => {}} 
                    onNavigateToProfile={() => profile && handleViewProfile(profile.user_id)} 
                    onNavigateToVendorAnalytics={() => {}} 
                    onStartTryOn={() => { setVtoItems([]); setCurrentScreen(Screen.ImageSourceSelection); }} 
                    isCartAnimating={false} 
                />
            )}
            {currentScreen === Screen.Confirmation && <ConfirmationScreen message="Look publicado no feed!" onHome={() => profile && handleViewProfile(profile.user_id)} />}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => {}} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => {}} onNavigateToCollaborations={() => {}} onSignOut={handleSignOut} />}
        </div>
    );
};

export default App;
